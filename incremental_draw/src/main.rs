use futures::channel::oneshot;
use incremental_draw::Chart;
use leptos::{html::*, *};
use wasm_bindgen::{prelude::Closure, JsCast};
use web_sys::CanvasRenderingContext2d;

pub fn main() {
    mount_to_body(|cx| view! { cx,  <MyComponent></MyComponent> })
}

fn request_frame<F: FnOnce() + 'static>(f: F) -> Option<i32> {
    let f = Closure::once(Box::new(f) as Box<dyn FnOnce()>);
    let res = window()
        .request_animation_frame(f.into_js_value().unchecked_ref())
        .ok()?;
    Some(res)
}

async fn frame_async() {
    let (sender, receiver) = oneshot::channel::<()>();
    request_frame(move || {
        sender.send(()).ok();
    });
    receiver.await.ok();
}

fn random_js() -> f64 {
    js_sys::Math::random()
}

fn random_walk(size: usize) -> Vec<f64> {
    let mut v = vec![0.0; size];
    for i in 1..size {
        v[i] = v[i - 1] + random_js() - 0.5;
    }
    v
}

#[component]
fn MyComponent(cx: Scope) -> impl IntoView {
    let canvas_ref: NodeRef<Canvas> = create_node_ref(cx);
    let (chart, write_chart) = create_signal(cx, None as Option<Chart>);

    canvas_ref.on_load(cx, move |node| {
        node.on_mount(move |node| {
            if let Some(ctx) = context_from(&node) {
                let base_data: Vec<f64> = random_walk(10_000_000);
                let mut chart_obj = Chart::build(&base_data, ctx);
                chart_obj.recalc();
                write_chart.set(Some(chart_obj));
            }
        });
    });

    create_resource(
        cx,
        move || chart.track(),
        move |_| {
            chart.track();
            async move {
                frame_async().await;
                chart.with(|chart| {
                    chart.as_ref().map(|chart| {
                        log!("draw");
                        chart.draw();
                    });
                });
            }
        },
    );

    let advance_chart = move |delta: i32| {
        write_chart.update(|chart| {
            chart.as_mut().map(|chart| {
                let view_range = &mut chart.view_range;
                view_range.1 = view_range.1.max(100);
                let add_delta = delta * (view_range.1 / 100).max(1) as i32;
                view_range.1 = if add_delta < 0 && add_delta.abs() > view_range.1 as i32 {
                    10
                } else {
                    (view_range.1 as i32 + add_delta) as usize
                };
                chart.recalc();
            });
        })
    };

    let view_elements =
        move || chart.with(|chart| chart.as_ref().map(|chart| chart.view_range.1).unwrap_or(1));

    view! {
        cx,
        <div>
            <div>"elements: " {move ||format_str(view_elements())}</div>
            <canvas node_ref=canvas_ref style="width: 100vw; height: 500px" on:wheel= move |event|{
                let delta = event.delta_y() as i32;
                advance_chart(delta);
            } ></canvas>
        </div>
    }
}

fn context_from(canvas: &HtmlElement<Canvas>) -> Option<CanvasRenderingContext2d> {
    let ctx = canvas
        .get_context("2d")
        .ok()??
        .dyn_into::<CanvasRenderingContext2d>()
        .ok()?;
    Some(ctx)
}

fn format_str(num: usize) -> String {
    let num = num.to_string();
    let mut res = String::new();
    num.chars().rev().enumerate().for_each(|(i, c)| {
        if i % 3 == 0 && i != 0 {
            res.push(',');
        }
        res.push(c);
    });
    res.chars().rev().collect()
}

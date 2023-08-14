use futures::channel::oneshot;
use incremental_draw::Chart;
use leptos::{html::*, *};
use wasm_bindgen::{prelude::Closure, JsCast};
use web_sys::{CanvasRenderingContext2d, PointerEvent};

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
    let (mouse_point, write_mouse_point) = create_signal(cx, (0.0, 0.0));
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
        move || (),
        move |_| async move {
            loop {
                frame_async().await;
                write_chart.update_untracked(|chart| {
                    chart.as_mut().map(|chart| {
                        chart.draw();
                    });
                });
            }
        },
    );

    let advance_chart = move |deltaY: i32, deltaX: i32| {
        write_chart.update(|chart| {
            chart.as_mut().map(|chart| {
                chart.zoom(deltaY, mouse_point.get().0);
                chart.slide(deltaX)
            });
        })
    };

    let view_elements = move || {
        chart.with(|chart| {
            chart
                .as_ref()
                .map(|chart| {
                    let range_size = chart.view_range.1 - chart.view_range.0;
                    let query = chart.query_range();
                    let (min, max) = chart.view_range;
                    format!(
                        "{}({}) - ({} - {}) / min: {}, max: {} | recalc time: {:.2}ms",
                        format_str(range_size),
                        format_percent(range_size, chart.get_size()),
                        format_percent(min, chart.get_size()),
                        format_percent(max, chart.get_size()),
                        query.min as i32,
                        query.max as i32,
                        chart.avg_recalc_time,
                    )
                })
                .unwrap_or("".to_string())
        })
    };

    view! {
        cx,
        <div>
            <div> {move ||view_elements()}</div>
            <canvas node_ref=canvas_ref style="width: 100vw; height: 500px"
            on:wheel= move |event|{
                let deltaY = event.delta_y() as i32;
                let deltaX = event.delta_x() as i32;
                advance_chart(deltaY, deltaX);
            }
            on:pointermove= move |event: PointerEvent|{
                write_mouse_point.set((event.offset_x() as f64, event.offset_y() as f64));
            }
            ></canvas>
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

fn format_percent(num: usize, reference: usize) -> String {
    format!("{:.2}%", (num as f64 / reference as f64) * 100.0)
}

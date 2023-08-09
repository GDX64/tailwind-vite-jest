use incremental_draw::{Chart, LinScale};
use leptos::{html::*, *};
use wasm_bindgen::JsCast;
use web_sys::CanvasRenderingContext2d;

pub fn main() {
    mount_to_body(|cx| view! { cx,  <MyComponent></MyComponent> })
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
    let chart = create_rw_signal(cx, None as Option<Chart>);

    create_effect(cx, move |_| {
        if let Some(ctx) = context_from(&canvas_ref) {
            let base_data: Vec<f64> = random_walk(10_000_000);
            let mut chart_obj = Chart::build(&base_data, ctx);
            chart_obj.recalc();
            chart.set(Some(chart_obj));
        }
    });

    create_effect(cx, move |_| {
        chart.with(|chart| {
            chart.as_ref().map(|chart| {
                chart.draw();
            });
        })
    });

    let advance_chart = move |delta: i32| {
        chart.update(|chart| {
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

    let view_elements = move || {
        chart.with(|chart| {
            chart
                .as_ref()
                .map(|chart| chart.view_range.1)
                .unwrap_or(1)
                .to_string()
        })
    };

    view! {
        cx,
        <div>
            <div>"elements: " {move ||(view_elements)()}</div>
            <canvas node_ref=canvas_ref style="width: 100%; height: 500px" on:wheel= move |event|{
                let delta = event.delta_y() as i32;
                advance_chart(delta);
            } ></canvas>
        </div>
    }
}

fn context_from(canvas: &NodeRef<Canvas>) -> Option<CanvasRenderingContext2d> {
    let ctx = canvas
        .get()?
        .get_context("2d")
        .ok()??
        .dyn_into::<CanvasRenderingContext2d>()
        .ok()?;
    Some(ctx)
}

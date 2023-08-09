use incremental_draw::{Chart, LinScale};
use leptos::{html::*, *};
use wasm_bindgen::JsCast;
use web_sys::CanvasRenderingContext2d;

pub fn main() {
    mount_to_body(|cx| view! { cx,  <MyComponent></MyComponent> })
}

#[component]
fn MyComponent(cx: Scope) -> impl IntoView {
    let canvas_ref: NodeRef<Canvas> = create_node_ref(cx);
    let chart = create_rw_signal(cx, None as Option<Chart>);

    create_effect(cx, move |_| {
        if let Some(ctx) = context_from(&canvas_ref) {
            let base_data: Vec<f64> = (0..1000_000).map(|i| ((i as f64) / 5000.0).sin()).collect();
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
                chart.view_range.1 += (delta * (chart.view_range.1 / 10) as i32) as usize;
                chart.recalc();
            });
        })
    };

    view! {
        cx,
        <div>
            <button on:click=move |_| {
                advance_chart(-1);
            }>-</button>
            <button on:click=move |_| {
                advance_chart(1);
            }>+</button>
            <canvas node_ref=canvas_ref style="width: 100%; height: 500px"></canvas>
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

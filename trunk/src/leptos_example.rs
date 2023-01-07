use crate::my_sigs::SignalLike;

use super::my_sigs as gsig;
use leptos::*;
use wasm_bindgen::prelude::wasm_bindgen;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, WheelEvent};

#[component]
pub fn SimpleCounter(cx: Scope) -> Element {
    // create a reactive signal with the initial value
    let (lep_range, set_range) = create_signal(cx, (0, 50_000));
    let (lep_dims, _set_dims) = create_signal(cx, (1000.0, 400.0));

    // create event handlers for our buttons
    // note that `value` and `set_value` are `Copy`, so it's super easy to move them into closures
    let on_wheel = move |event: WheelEvent| {
        log("wheel");
        if event.delta_y() > 0.0 {
            set_range.update(|(_, end)| *end = ((*end as f64) / 1.1) as usize);
        } else {
            set_range.update(|(_, end)| *end = ((*end as f64) * 1.1) as usize);
        }
    };
    let range = gsig::Signal::new(lep_range.get());
    let data = gsig::Signal::new(gen_data(500_000));
    let dims = gsig::Signal::new(lep_dims.get());
    let draw = gsig::create_draw(range.clone(), data, dims);
    let canvas = NodeRef::new(cx);
    let as_px = |v: f64| format!("{}px", v);
    // this JSX is compiled to an HTML template string for performance
    let el = view! {
        cx,
        <div on:wheel=on_wheel>
            <span>"Value: " {move || lep_range().1} "!"</span>
            <canvas
            _ref=canvas
            style="display: block;"
            width=move|| as_px(lep_dims().0)
            height=move|| as_px(lep_dims().1)
            ></canvas>
        </div>
    };

    create_effect(cx, move |_| {
        if let Some(ctx) = get_context2d(canvas) {
            range.set(lep_range.get());
            (draw.get_ref())(&ctx);
        }
    });
    el
}

fn gen_data(n: usize) -> Vec<(f64, f64)> {
    let mut v = vec![(0.0, 0.0); n];
    for i in 1..n {
        v[i].0 = (i * 10usize) as f64;
        v[i].1 = random() + v[i - 1].1 - 0.5;
    }
    v
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(str: &str);
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

// Easy to use with Trunk (trunkrs.dev) or with a simple wasm-bindgen setup
pub fn main() {
    mount_to_body(|cx| {
        view! { cx,  <SimpleCounter /> }
    });
}

fn get_context2d(canvas: NodeRef) -> Option<CanvasRenderingContext2d> {
    canvas
        .get()?
        .dyn_into::<HtmlCanvasElement>()
        .ok()?
        .get_context("2d")
        .ok()??
        .dyn_into::<CanvasRenderingContext2d>()
        .ok()
}

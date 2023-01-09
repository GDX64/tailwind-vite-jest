use crate::my_sigs::SignalLike;

use super::my_sigs as gsig;
use leptos::*;
use wasm_bindgen::prelude::wasm_bindgen;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, WheelEvent};

#[component]
pub fn SimpleCounter(cx: Scope) -> Element {
    // create a reactive signal with the initial value
    let (lep_range, set_range) = create_signal(cx, (0, 1000));
    let (lep_dims, _set_dims) = create_signal(cx, (1000.0, 400.0));

    // create event handlers for our buttons
    // note that `value` and `set_value` are `Copy`, so it's super easy to move them into closures
    let on_wheel = move |event: WheelEvent| {
        if event.delta_y() > 0.0 {
            set_range.update(|(_, end)| *end = ((*end as f64) / 1.1) as usize);
        } else {
            set_range.update(|(_, end)| *end = ((*end as f64) * 1.1) as usize);
        }
    };
    let range = gsig::Signal::new(lep_range.get());
    let data = gsig::Signal::new(gen_data(100_000));
    let dims = gsig::Signal::new(lep_dims.get());
    let average_samples = gsig::Signal::new(5);
    let avg_clone = average_samples.clone();
    let data_clone = data.clone();
    let draw = gsig::create_draw(range.clone(), data, dims, average_samples);
    let canvas = NodeRef::new(cx);
    let (input_text, set_text) = create_signal(cx, "".to_string());
    let on_input = move |event: web_sys::InputEvent| {
        set_text.update(|value| {
            let v = event_target_value(&event);
            *value = v;
        });
    };
    let on_keyup = move |event: web_sys::KeyboardEvent| {
        log!("{}", event.key_code());
        if event.key_code() == 13 {
            parse_command(&input_text(), &data_clone, &avg_clone);
        }
    };
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
            <input value = move||input_text() on:input=on_input on:keyup=on_keyup></input>
        </div>
    };
    create_effect(cx, move |_| {
        range.set(lep_range.get());
    });
    wasm_bindgen_futures::spawn_local(draw.block_on(move |drawable| {
        if let Some(ctx) = get_context2d(canvas) {
            drawable(&ctx);
        }
        false
    }));
    el
}

fn gen_data(n: usize) -> Vec<gsig::Signal<f64>> {
    let mut v = vec![0.0; n];
    for i in 1..n {
        v[i] = random() + v[i - 1] - 0.5;
    }
    v.iter().map(|v| gsig::Signal::new(*v)).collect()
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
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
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

fn parse_command(s: &str, data: &gsig::Signal<Vec<gsig::Signal<f64>>>, avg: &gsig::Signal<i32>) {
    let mut iter = s.split(" ");
    match (iter.next(), iter.next(), iter.next()) {
        (Some("change"), Some(index), Some(value)) => {
            let index: usize = index.parse().unwrap();
            let value: usize = value.parse().unwrap();
            data.with(|v| v[index].set(value as f64));
        }
        (Some("average"), Some(value), _) => avg.set(value.parse().unwrap()),
        _ => (),
    }
}

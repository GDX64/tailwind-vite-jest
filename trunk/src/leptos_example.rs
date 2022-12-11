use std::fmt::Debug;

use leptos::*;
use wasm_bindgen::prelude::wasm_bindgen;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, WheelEvent};

#[component]
pub fn SimpleCounter(cx: Scope) -> Element {
    // create a reactive signal with the initial value
    let (range, set_range) = create_signal(cx, (0, 80_000));
    let (data, _set_data) = create_signal(cx, LineChart::gen_data(100_000));
    let (dims, _set_dims) = create_signal(cx, (1000.0, 400.0));

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
    let draw = create_memo(cx, move |_| create_draw(cx, range, data, dims));
    let canvas = NodeRef::new(cx);
    let as_px = |v: f64| format!("{}px", v);
    // this JSX is compiled to an HTML template string for performance
    let el = view! {
        cx,
        <div on:wheel=on_wheel>
            <span>"Value: " {move || range().1} "!"</span>
            <canvas
            _ref=canvas
            style="display: block;"
            width=move|| as_px(dims().0)
            height=move|| as_px(dims().1)
            ></canvas>
        </div>
    };

    create_effect(cx, move |_| {
        if let Some(ctx) = get_context2d(canvas) {
            draw.with(|chart| chart.draw(&ctx));
        }
    });
    el
}

fn create_draw(
    cx: Scope,
    range: ReadSignal<(usize, usize)>,
    data: ReadSignal<Vec<(f64, f64)>>,
    dims: ReadSignal<(f64, f64)>,
) -> LineChart {
    log("draw made");
    let in_range = create_memo(cx, move |_| {
        let (begin, end) = range();
        begin.max(0)..end.min(data.with(|data| data.len()))
    });
    let scales = create_memo(cx, move |_| {
        log("recalc scale");
        if let Some(((x_min, x_max), (y_min, y_max))) =
            data.with(|data| LineChart::min_max(&data[in_range()]))
        {
            let (w, h) = dims();
            let scale_x = Scale::from((x_min, x_max), (0.0, w));
            let scale_y = Scale::from((y_min, y_max), (0.0, h));
            return Some((scale_x, scale_y));
        }
        None
    });
    let scaled_data = create_memo(cx, move |_| -> Vec<(f64, f64)> {
        log("scaled data");
        scales.with(|s| {
            if let Some((scale_x, scale_y)) = s {
                let mapped = data.with(|data| {
                    data[in_range()]
                        .iter()
                        .map(|point| (scale_x.apply(point.0), scale_y.apply(point.1)))
                        .collect::<Vec<_>>()
                });
                return mapped;
            }
            vec![]
        })
    });
    LineChart { scaled_data, dims }
}

#[derive(Debug, PartialEq)]
struct LineChart {
    scaled_data: Memo<Vec<(f64, f64)>>,
    dims: ReadSignal<(f64, f64)>,
}

impl LineChart {
    fn gen_data(n: usize) -> Vec<(f64, f64)> {
        let mut v = vec![(0.0, 0.0); n];
        for i in 1..n {
            v[i].0 = (i * 10usize) as f64;
            v[i].1 = random() + v[i - 1].1 - 0.5;
        }
        v
    }

    #[inline(never)]
    fn min_max(v: &[(f64, f64)]) -> Option<((f64, f64), (f64, f64))> {
        if v.len() < 1 {
            return None;
        }
        let result = v.iter().copied().fold(
            ((v[0].0, v[0].0), (v[0].1, v[0].1)),
            |(acc_x, acc_y), item| {
                let x_min = (acc_x.0.min(item.0), acc_x.1.max(item.0));
                let y_min = (acc_y.0.min(item.1), acc_y.1.max(item.1));
                (x_min, y_min)
            },
        );
        Some(result)
    }
}

impl Drawable for LineChart {
    #[inline(never)]
    fn draw(&self, ctx: &CanvasRenderingContext2d) {
        log("draw");
        let (w, h) = self.dims.get();
        ctx.clear_rect(0.0, 0.0, w, h);
        ctx.begin_path();
        ctx.move_to(0.0, 0.0);
        self.scaled_data.with(|data| {
            data.iter().for_each(|(x, y)| {
                ctx.line_to(*x, *y);
            })
        });
        ctx.stroke();
    }
}

#[derive(Debug, PartialEq)]
struct Scale {
    alpha: f64,
    k: f64,
}

impl Scale {
    fn apply(&self, x: f64) -> f64 {
        self.alpha * x + self.k
    }

    fn from(domain: (f64, f64), image: (f64, f64)) -> Scale {
        let alpha = (image.1 - image.0) / (domain.1 - domain.0);
        Scale {
            alpha,
            k: image.0 - domain.0 * alpha,
        }
    }
}

trait Drawable: PartialEq + Debug + 'static {
    fn draw(&self, ctx: &CanvasRenderingContext2d);
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

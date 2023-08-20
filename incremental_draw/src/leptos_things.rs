use std::cell::RefCell;
use std::rc::Rc;

use crate::chart_core::dpr;
use crate::chart_core::now;
use crate::chart_core::ChartView;
use crate::chart_core::DrawableChart;
use crate::transitions::Transition;

use super::chart_things::Chart;
use futures::channel::oneshot;
use leptos::html::Canvas;
use leptos::*;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, PointerEvent};

#[wasm_bindgen]
pub fn leptos_main(s: &str) -> JsValue {
    // mount_to(parent, f);
    fn get_element(s: &str) -> Option<web_sys::HtmlElement> {
        let el = web_sys::window()?.document()?.query_selector(s).ok()??;
        let el = el.dyn_into::<web_sys::HtmlElement>().ok()?;
        Some(el)
    }
    let maybe_scope = Rc::new(RefCell::new(None));
    let maybe_scope_clone = maybe_scope.clone();
    if let Some(el) = get_element(s) {
        mount_to(el, move |cx| {
            let cx_copy = cx.clone();
            maybe_scope.borrow_mut().replace(cx_copy);
            return view! { cx,  <MyComponent></MyComponent> };
        });
    } else {
        mount_to_body(|cx| view! { cx,  <MyComponent></MyComponent> });
    }
    let dispose = Closure::once(move || {
        if let Some(scope) = maybe_scope_clone.borrow_mut().take() {
            scope.dispose();
        }
    })
    .into_js_value();
    dispose
}

async fn frame_async(f: impl FnOnce() + 'static) {
    let (sender, receiver) = oneshot::channel::<()>();
    leptos::request_animation_frame(move || {
        sender.send(()).ok();
        f();
    });
    receiver.await.ok();
}

fn random_js() -> f64 {
    js_sys::Math::random()
}

#[component]
fn MyComponent(cx: Scope) -> impl IntoView {
    let canvas_ref: NodeRef<Canvas> = create_node_ref(cx);
    let chart = Chart::build(1_000_000);
    let (_, write_chart) = create_signal(cx, Box::new(chart) as Box<dyn DrawableChart>);
    let (mouse_point, write_mouse_point) = create_signal(cx, (0.0, 0.0));
    let (is_pointer_down, write_is_pointer_down) = create_signal(cx, false);
    let (times, write_times) = create_signal(cx, (0.0, 0.0));
    let (current_view, write_current_view) = create_signal(
        cx,
        Transition::new(ChartView::default(), ChartView::default(), 100.0),
    );
    canvas_ref.on_load(cx, move |node| {
        node.on_mount(move |node| {
            let dpr = dpr();
            let width = ((node.client_width() as f64) * dpr) as u32;
            let height = ((node.client_height() as f64) * dpr) as u32;
            node.set_width(width);
            node.set_height(height);
            write_chart.update(|chart| {
                chart.set_canvas_size((width, height));
            })
        });
    });

    create_resource(
        cx,
        move || (),
        move |_| async move {
            loop {
                frame_async(move || {}).await;
                write_chart.update_untracked(|chart| {
                    let canvas = canvas_ref.get().expect("there should be a canvas");
                    let ctx = context_from(&canvas).expect("there should be a context");
                    if chart.is_dirty() {
                        let (mut recalc_time, mut redraw_time) = (0.0, 0.0);
                        write_current_view.update(|view| {
                            let recalc_start = now();
                            let view_now = chart.get_view();
                            recalc_time = now() - recalc_start;
                            let redraw_start = now();
                            view.update_target(view_now, now());
                            view.now().draw(&ctx);
                            redraw_time = now() - redraw_start;
                        });
                        write_times.update(|(recalc_now, redraw_now)| {
                            *recalc_now = recalc_time * 0.1 + *recalc_now * 0.9;
                            *redraw_now = *redraw_now * 0.9 + redraw_time * 0.1;
                        });
                    } else if current_view.get().progress() < 1.0 {
                        write_current_view.update(|view| {
                            view.update_time(now());
                            view.now().draw(&ctx);
                        });
                    }
                });
            }
        },
    );

    let advance_chart = move |deltaY: i32, deltaX: i32| {
        write_chart.update(|chart| {
            chart.zoom(deltaY, mouse_point.get().0);
            chart.slide(deltaX);
        })
    };

    let view_elements = move || {
        let (recalc_time, redraw_time) = times.get();
        format!("Recalc: {:.2}ms, Redraw: {:.2}ms", recalc_time, redraw_time)
    };

    view! {
        cx,
        <div style="overflow: hidden; width: 100%; height: fit-content; user-select: none; overscroll-behavior: none;">
            <div> {move ||view_elements()}</div>
            <canvas node_ref=canvas_ref style="width: 100%; height: 500px"
            on:wheel= move |event|{
                let deltaY = event.delta_y() as i32;
                let deltaX = event.delta_x() as i32;
                advance_chart(deltaY, deltaX);
            }
            on:pointermove= move |event: PointerEvent|{
                if is_pointer_down.get() {
                    let deltaX = event.client_x() - mouse_point.get().0 as i32;
                    let deltaY = event.client_y() - mouse_point.get().1 as i32;
                    advance_chart(deltaY, deltaX);
                }
                write_mouse_point.set((event.client_x() as f64, event.client_y() as f64));
            }
            on:pointerdown=move |_|{
                write_is_pointer_down.set(true);
            }
            on:pointerup=move |_|{
                write_is_pointer_down.set(false);
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

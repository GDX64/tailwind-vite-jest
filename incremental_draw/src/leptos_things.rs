use leptos::html::Canvas;
use leptos::*;
use piet::{kurbo, RenderContext};
use piet::{Color};
use piet_web::WebRenderContext;
use taffy::Taffy;
use wasm_bindgen::JsCast;
use web_sys::window;
use web_sys::CanvasRenderingContext2d;

use crate::layout::{MyShapes, calc_layout, LayoutResults};

pub fn run(ctx: CanvasRenderingContext2d)->Option<()> {
    let canvas = ctx.canvas().expect("there should be a canvas");
    let win = window().unwrap();
    let dpr = win.device_pixel_ratio();
    canvas.set_width((canvas.offset_width() as f64 * dpr) as u32);
    canvas.set_height((canvas.offset_height() as f64 * dpr) as u32);
    let mut piet_context = WebRenderContext::new(ctx, win);
    let shapes = MyShapes::Rect {
        color: Color::from_rgba32_u32(0xff000033),
        size: (300.0, 200.0),
        children: vec![
            MyShapes::Rect {
                color: Color::from_rgba32_u32(0xffff0088),
                size: (50.0, 50.0),
                children: vec![],
            },
            MyShapes::Rect {
                color: Color::from_rgba32_u32(0x00ff0088),
                size: (100.0, 100.0),
                children: vec![
                    MyShapes::Rect {
                        color: Color::from_rgba32_u32(0xffff0088),
                        size: (25.0, 25.0),
                        children: vec![],
                    },
                    MyShapes::Rect {
                        color: Color::from_rgba32_u32(0xffff0088),
                        size: (25.0, 25.0),
                        children: vec![],
                    },
                    MyShapes::Rect {
                        color: Color::from_rgba32_u32(0xffff0088),
                        size: (25.0, 25.0),
                        children: vec![],
                    },
                    MyShapes::Rect {
                        color: Color::from_rgba32_u32(0xffff0088),
                        size: (25.0, 25.0),
                        children: vec![],
                    },
                ],
            },
            MyShapes::Rect {
                color: Color::from_rgba32_u32(0x00ffff88),
                size: (50.0, 50.0),
                children: vec![],
            },
        ]
    };
    let (layout, taffy) = calc_layout(shapes)?;
    
    draw_all(&mut piet_context, layout, &taffy);
    piet_context.finish().unwrap();
    Some(())
}



fn draw_all(ctx: &mut impl RenderContext, shape: LayoutResults, taffy: &Taffy) {
    match shape {
        LayoutResults::Rect { color, children, node } => {
            let layout = taffy.layout(node).expect("there should be a layout for every node");
            let rect = kurbo::Rect::from_origin_size((0.0, 0.0), (layout.size.width as f64, layout.size.height as f64));
            ctx.save().ok();
            ctx.transform(kurbo::Affine::translate((layout.location.x as f64, layout.location.y as f64)));
            ctx.fill(rect, &color);
            leptos::log!("{color:?}, {rect:?}");
                for child in children {
                    draw_all(ctx, child, &taffy);
                }
                ctx.restore().ok();
            }
        }
}

pub fn leptos_main() {
    leptos::mount_to_body(|cx| {
        let canvas_ref = leptos::create_node_ref::<leptos::html::Canvas>(cx);
        canvas_ref.on_load(cx, |canvas| {
            canvas.on_mount(|canvas| {
                fn takes_canvas(canvas: HtmlElement<Canvas>) -> Option<()> {
                    let res = canvas
                        .get_context("2d")
                        .ok()??
                        .dyn_into::<CanvasRenderingContext2d>()
                        .ok()?;
                    run(res);
                    Some(())
                }
                takes_canvas(canvas);
            });
        });
        view! {cx,
            <div>
                <h1>"Some rects"</h1>
                <canvas node_ref=canvas_ref>
                </canvas>
            </div>
        }
    });
}
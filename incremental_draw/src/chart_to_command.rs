use crate::chart_core::adjust_dpr;
use crate::chart_core::now;
use crate::chart_core::ChartKind;
use crate::chart_core::ChartView;
use crate::chart_core::DrawableChart;
use crate::transitions::Transition;

use super::chart_things::Chart;
use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

#[wasm_bindgen]
pub struct ChartToCommand {
    chart: Chart,
    mouse_point: (i32, i32),
    ctx: CanvasRenderingContext2d,
    view: Transition<ChartView>,
    kind: ChartKind,
    interpolate: bool,
    recalc_time: f64,
    redraw_time: f64,
    show_stats: bool,
}

#[wasm_bindgen]
impl ChartToCommand {
    pub fn new(ctx: CanvasRenderingContext2d) -> ChartToCommand {
        ChartToCommand {
            chart: Chart::build(1_000_000),
            mouse_point: (0, 0),
            ctx,
            view: Transition::new(ChartView::default(), ChartView::default(), 100.0),
            kind: ChartKind::CANDLES,
            interpolate: true,
            recalc_time: 0.0,
            redraw_time: 0.0,
            show_stats: false,
        }
    }

    pub fn change_settings(&mut self, interpolate: bool, show_stats: bool, kind: u8) {
        self.interpolate = interpolate;
        self.show_stats = show_stats;
        match kind {
            0 => self.kind = ChartKind::CANDLES,
            1 => self.kind = ChartKind::LINE,
            _ => self.kind = ChartKind::STICK,
        }
        self.chart.set_dirty();
    }

    pub fn pointer_down(&mut self, x: i32, y: i32) {
        self.mouse_point = (x, y);
    }

    pub fn zoom(&mut self, delta_y: i32, point_x: f64) {
        self.chart.zoom(delta_y, point_x);
    }

    pub fn slide(&mut self, delta_x: i32) {
        self.chart.slide(delta_x);
    }

    pub fn wheel(&mut self, delta_y: i32, delta_x: i32, point_x: f64) {
        self.chart.zoom(delta_y, point_x);
        self.chart.slide(delta_x);
    }

    pub fn on_size_change(&mut self, width: u32, height: u32) {
        self.chart.set_canvas_size((width, height));
    }

    pub fn on_new_frame(&mut self) {
        let should_draw = if self.chart.is_dirty() {
            let start = now();
            let mut view_now = self.chart.get_view();
            view_now.kind = self.kind.clone();
            self.view.update_target(view_now, now());
            self.recalc_time = now() - start;
            true
        } else if self.view.progress() < 1.0 {
            self.view.update_time(now());
            true
        } else {
            false
        };
        if should_draw {
            let start = now();
            if self.interpolate {
                self.view.now().draw(&self.ctx);
            } else {
                self.view.get_target().draw(&self.ctx);
            }
            self.redraw_time = now() - start;
            if self.show_stats {
                self.draw_stats();
            }
        }
    }

    fn draw_stats(&self) {
        self.ctx.save();
        self.ctx.set_fill_style(&JsValue::from_str("#00ff00"));
        self.ctx.set_text_baseline("top");
        self.ctx.set_text_align("left");
        let font_size = adjust_dpr(12);
        self.ctx.set_font(&format!("{}px sans-serif", font_size));
        self.ctx
            .fill_text(&format!("recalc: {:.2}ms", self.recalc_time,), 10.0, 0.0)
            .ok();
        self.ctx
            .fill_text(
                &format!("redraw: {:.2}ms", self.redraw_time),
                10.0,
                font_size as f64,
            )
            .ok();
        self.ctx.restore();
    }
}

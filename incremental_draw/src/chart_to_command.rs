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
        }
    }

    pub fn change_chart_kind(&mut self, kind: u8) {
        match kind {
            0 => self.kind = ChartKind::CANDLES,
            1 => self.kind = ChartKind::LINE,
            _ => {
                self.kind = ChartKind::STICK;
            }
        }
        self.chart.set_dirty();
    }

    pub fn change_interpolate(&mut self, interpolate: bool) {
        self.interpolate = interpolate;
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
            view_now.recalc_time = now() - start;
            view_now.kind = self.kind.clone();
            self.view.update_target(view_now, now());
            true
        } else if self.view.progress() < 1.0 {
            self.view.update_time(now());
            self.view.now().draw(&self.ctx);
            true
        } else {
            false
        };
        if should_draw {
            if self.interpolate {
                self.view.now().draw(&self.ctx);
            } else {
                self.view.get_target().draw(&self.ctx);
            }
        }
    }
}

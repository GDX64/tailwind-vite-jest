use crate::chart_core::now;
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
}

#[wasm_bindgen]
impl ChartToCommand {
    pub fn new(ctx: CanvasRenderingContext2d) -> ChartToCommand {
        ChartToCommand {
            chart: Chart::build(1_000_000),
            mouse_point: (0, 0),
            ctx,
            view: Transition::new(ChartView::default(), ChartView::default(), 100.0),
        }
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
        if self.chart.is_dirty() {
            let view_now = self.chart.get_view();
            self.view.update_target(view_now, now());
            self.view.now().draw(&self.ctx);
        } else if self.view.progress() < 1.0 {
            self.view.update_time(now());
            self.view.now().draw(&self.ctx);
        }
    }
}

use crate::chart_core::{adjust_dpr, dpr, LinScale};
use chrono::NaiveDateTime;
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

#[derive(Clone, Debug, PartialEq)]
pub struct TimeScale {
    dates: Vec<NaiveDateTime>,
    scale: LinScale,
}

impl Default for TimeScale {
    fn default() -> Self {
        Self::new(vec![], LinScale::new((0.0, 1.0), (0.0, 1.0)))
    }
}

impl TimeScale {
    pub fn new(dates: Vec<NaiveDateTime>, scale: LinScale) -> TimeScale {
        TimeScale { dates, scale }
    }

    fn calc_ticks(&self) -> Vec<(f64, String)> {
        let target_tick_size = adjust_dpr(50);
        let size_px = self.scale.get_base_range() as usize;
        let pixel_per_candle = size_px / self.dates.len();
        let candles_per_tick = (target_tick_size / pixel_per_candle) + 1;
        let result = self
            .dates
            .chunks(candles_per_tick)
            .enumerate()
            .filter_map(|chunk| match chunk.1 {
                [first, .., last] => {
                    let pos_x = self.scale.apply((chunk.0 * candles_per_tick) as f64);
                    return Some((pos_x, Self::choose_best_label(first, last)));
                }
                _ => None,
            })
            .collect::<Vec<_>>();
        result
    }

    fn choose_best_label(first: &NaiveDateTime, last: &NaiveDateTime) -> String {
        let duration = last.signed_duration_since(*first);
        if duration.num_days() > 365 {
            // years
            first.format("%Y").to_string()
        } else if duration.num_days() > 30 {
            first.format("%Y/%m").to_string()
            // months
        } else if duration.num_days() > 1 {
            first.format("%m/%d").to_string()
            // days
        } else {
            first.format("%H:%M").to_string()
            //
        }
    }

    fn calc_master_label(&self) -> Option<String> {
        let first = self.dates.first()?;
        let last = self.dates.last()?;
        let duration = last.signed_duration_since(*first);
        let result = if duration.num_days() > 365 {
            // years
            let first_label = first.format("%Y");
            let last_label = last.format("%Y");
            format!("{} - {}", first_label, last_label)
        } else if duration.num_days() > 30 {
            first.format("%Y").to_string()
            // months
        } else if duration.num_days() > 1 {
            first.format("%Y/%m").to_string()
            // days
        } else {
            first.format("%Y/%m/%d").to_string()
            //
        };
        Some(result)
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d, width: f64, height: f64) {
        ctx.set_font(&format!("{}px sans-serif", adjust_dpr(12)));
        ctx.set_fill_style(&JsValue::from_str("#00000066"));
        let dpr = dpr();
        let rect_height = 20.0 * dpr;
        let title_rect = 25.0 * dpr;
        ctx.fill_rect(0.0, height - rect_height, width, rect_height);
        ctx.fill_rect(0.0, 0.0, width, title_rect);
        ctx.set_fill_style(&JsValue::from_str("#ffffff"));
        self.calc_ticks().iter().for_each(|(pos_x, label)| {
            // ctx.fill_rect(pos_x - 2.0, height - 20.0, 1.0, 10.0);
            ctx.fill_text(label, *pos_x, height - 5.0 * dpr).ok();
        });
        ctx.set_text_align("center");
        if let Some(label) = self.calc_master_label() {
            ctx.set_font(&format!("{}px sans-serif", adjust_dpr(20)));
            ctx.fill_text(&label, width / 2.0, 20.0 * dpr).ok();
        }
    }
}

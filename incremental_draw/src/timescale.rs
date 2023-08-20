use crate::chart_core::LinScale;
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
        const TARGET_TICK_SIZE: usize = 100;
        let size_px = self.scale.get_base_range() as usize;
        let pixel_per_candle = size_px / self.dates.len();
        let candles_per_tick = (TARGET_TICK_SIZE / pixel_per_candle) + 1;
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
            first.format("%m/%Y").to_string()
            // months
        } else if duration.num_days() > 1 {
            first.format("%d").to_string()
            // days
        } else {
            first.format("%H:%M").to_string()
            //
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d, height: f64) {
        ctx.set_font("15px sans-serif");
        ctx.set_fill_style(&JsValue::from_str("black"));
        ctx.set_text_align("center");
        self.calc_ticks().iter().for_each(|(pos_x, label)| {
            ctx.fill_text(label, *pos_x, height - 5.0);
        });
    }
}

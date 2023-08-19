use segment_tree::{ops::Operation, SegmentPoint};
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

use crate::{color_things::RGB, transitions::CanTransition};

pub const CANDLE_WIDTH: f64 = 7.0;
const CANDLE_PADDING: f64 = 1.0;
// const TRANSITION_TIME: f64 = 100.0;

pub fn dpr() -> f64 {
    web_sys::window()
        .map(|win| win.device_pixel_ratio())
        .unwrap_or(1.0)
}

pub fn now() -> f64 {
    fn now_opt() -> Option<f64> {
        Some(web_sys::window()?.performance()?.now())
    }
    now_opt().unwrap_or(0.0)
}

impl CanTransition for ChartView {
    fn interpolate(&self, other: &Self, t: f64) -> Self {
        if other.candles.len() != self.candles.len() {
            return other.clone();
        }
        ChartView {
            candles: self
                .candles
                .iter()
                .zip(&other.candles)
                .map(|(source, target)| source.interpolate(&target, t))
                .collect(),
        }
    }
}

#[derive(PartialEq, Clone)]
pub struct LinScale {
    k: f64,
    alpha: f64,
}

impl LinScale {
    pub fn new(domain: (f64, f64), range: (f64, f64)) -> LinScale {
        let alpha = (range.1 - range.0) / (domain.1 - domain.0);
        let k = range.0 - alpha * domain.0;
        LinScale { k, alpha }
    }

    pub fn apply(&self, x: f64) -> f64 {
        self.alpha * x + self.k
    }

    pub fn apply_inv(&self, y: f64) -> f64 {
        (y - self.k) / self.alpha
    }
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Candle {
    pub min: f64,
    pub max: f64,
    pub open: f64,
    pub close: f64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct VisualCandle {
    pub candle: Candle,
    pub color: RGB,
    pub x: f64,
}

impl VisualCandle {
    fn draw(&self, ctx: &CanvasRenderingContext2d, width: f64, padding: f64) {
        let hex_color = self.color.to_hex();
        let js_color = JsValue::from_str(&hex_color);
        ctx.set_fill_style(&js_color);
        ctx.set_stroke_style(&js_color);
        let candle = &self.candle;
        let x = self.x;
        ctx.stroke_rect(
            x + width / 2.0,
            candle.max,
            1.0,
            (candle.max - candle.min).abs(),
        );
        let upper = candle.open.max(candle.close);
        let lower = candle.open.min(candle.close);
        let width = width - padding * 2.0;
        ctx.fill_rect(x + padding as f64, lower, width, upper - lower);
    }

    fn interpolate(&self, other: &Self, percent: f64) -> Self {
        let candle = Candle {
            min: self.candle.min + (other.candle.min - self.candle.min) * percent,
            max: self.candle.max + (other.candle.max - self.candle.max) * percent,
            open: self.candle.open + (other.candle.open - self.candle.open) * percent,
            close: self.candle.close + (other.candle.close - self.candle.close) * percent,
        };
        let color = self.color.interpolate(&other.color, percent as f32);
        VisualCandle {
            candle,
            color,
            x: self.x + (other.x - self.x) * percent,
        }
    }
}

impl Candle {
    pub fn new(min: f64, max: f64, open: f64, close: f64) -> Candle {
        Candle {
            min,
            max,
            open,
            close,
        }
    }

    pub fn to_visual(&self, index: usize, scale_x: &LinScale, scale_y: &LinScale) -> VisualCandle {
        let min = scale_y.apply(self.min);
        let max = scale_y.apply(self.max);
        let close = scale_y.apply(self.close);
        let open = scale_y.apply(self.open);
        let x = scale_x.apply(index as f64);
        let candle = Candle::new(min, max, close, open);
        let color = if self.is_positive() {
            RGB {
                r: 0x33,
                g: 0xaa,
                b: 0x11,
            }
        } else {
            RGB {
                r: 0xaa,
                g: 0x33,
                b: 0x11,
            }
        };
        VisualCandle { candle, color, x }
    }

    fn is_positive(&self) -> bool {
        self.close > self.open
    }

    pub fn same(val: f64) -> Candle {
        Candle::new(val, val, val, val)
    }
}

pub struct MinMaxOp;

impl Operation<Candle> for MinMaxOp {
    fn combine(&self, a: &Candle, b: &Candle) -> Candle {
        Candle {
            min: a.min.min(b.min),
            max: a.max.max(b.max),
            open: a.open,
            close: b.close,
        }
    }
}

pub type MinMaxTree = SegmentPoint<Candle, MinMaxOp>;

#[derive(Clone, Debug, PartialEq)]
pub struct ChartView {
    pub candles: Vec<VisualCandle>,
}

impl ChartView {
    pub fn from_visual_candles(candles: Vec<VisualCandle>) -> Self {
        Self { candles }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) {
        ctx.save();
        let canvas = ctx.canvas().expect("there should be a canvas");
        let width = canvas.width() as f64;
        let height = canvas.height() as f64;
        ctx.clear_rect(0.0, 0.0, width, height);
        let width = dpr() * CANDLE_WIDTH;
        let padding = dpr() * CANDLE_PADDING;
        self.candles
            .iter()
            .for_each(|candle| candle.draw(ctx, width, padding));
        ctx.restore();
    }
}

impl Default for ChartView {
    fn default() -> Self {
        Self {
            candles: Vec::new(),
        }
    }
}

pub trait DrawableChart {
    fn get_view(&mut self) -> ChartView;
    fn is_dirty(&self) -> bool;
    fn zoom(&mut self, delta: i32, mouse_x: f64);
    fn slide(&mut self, delta: i32);
    fn set_canvas_size(&mut self, size: (u32, u32));
}

pub fn update_zoom(
    view_range: (usize, usize),
    delta: i32,
    center_point: f64,
    curr_step: usize,
    data_size: usize,
    scale_x: &LinScale,
) -> (usize, usize) {
    let (min, max) = view_range;
    let point_index = ((scale_x.apply_inv(center_point * dpr()) as usize) * curr_step) + min;
    let point_index = point_index.max(0).min(data_size) as i32;
    let min = min as i32;
    let max = max as i32;
    let range = max - min;
    let range_left = point_index - min;
    let range_right = max - point_index;
    let delta_left = (delta * range_left) / 100;
    let delta_right = (delta * range_right) / 100;
    let new_max = (max + delta_right)
        .max(point_index + 1)
        .min(data_size as i32);
    let new_min = (min - delta_left).max(0).min(point_index - 1);
    if range + delta_left + delta_right < 10_000 {
        view_range
    } else {
        (
            new_min.max(0) as usize,
            new_max.min(data_size as i32) as usize,
        )
    }
}

pub fn slide(
    view_range: (usize, usize),
    delta: i32,
    curr_step: usize,
    data_size: usize,
) -> (usize, usize) {
    let view_range = view_range;
    let gap = (view_range.1 - view_range.0) as i32;
    let min = view_range.0 as i32 + (curr_step as i32) * delta;
    let min = min.max(0);
    let max = min + gap;
    if max > data_size as i32 {
        (data_size - gap as usize, data_size)
    } else {
        (min as usize, max as usize)
    }
}

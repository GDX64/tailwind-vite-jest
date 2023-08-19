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

impl CanTransition for Vec<VisualCandle> {
    fn interpolate(&self, other: &Self, t: f64) -> Self {
        if other.len() != self.len() {
            return other.clone();
        }
        self.iter()
            .zip(other)
            .map(|(source, target)| source.interpolate(&target, t))
            .collect()
    }
}

#[derive(PartialEq)]
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

#[derive(Clone, Copy, Debug)]
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

    pub fn to_visual(&self, x: f64) -> VisualCandle {
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
        VisualCandle {
            candle: *self,
            color,
            x,
        }
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
}

use chrono::NaiveDateTime;
use segment_tree::{ops::Operation, SegmentPoint};
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

use crate::{color_things::RGB, timescale::TimeScale, transitions::CanTransition};

pub const CANDLE_WIDTH: f64 = 7.0;
const CANDLE_PADDING: f64 = 1.0;
const MIN_RANGE: i32 = 500;
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
            timescale: other.timescale.clone(),
            kind: other.kind.clone(),
        }
    }
}

pub fn adjust_dpr(val: usize) -> usize {
    ((val as f64) * dpr()) as usize
}

#[derive(PartialEq, Clone, Debug)]
pub struct LinScale {
    k: f64,
    alpha: f64,
    image: (f64, f64),
}

impl LinScale {
    pub fn new(domain: (f64, f64), range: (f64, f64)) -> LinScale {
        let alpha = (range.1 - range.0) / (domain.1 - domain.0);
        let k = range.0 - alpha * domain.0;
        LinScale {
            k,
            alpha,
            image: range,
        }
    }

    pub fn get_base_range(&self) -> f64 {
        self.image.1 - self.image.0
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
    pub start: u64,
    pub end: u64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct VisualCandle {
    pub candle: Candle,
    pub color: RGB,
    pub x: f64,
}

impl VisualCandle {
    fn draw(&self, ctx: &CanvasRenderingContext2d, width: f64, padding: f64, kind: &ChartKind) {
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
        if kind == &ChartKind::CANDLES {
            let upper = candle.open.max(candle.close);
            let lower = candle.open.min(candle.close);
            let width = width - padding * 2.0;
            ctx.fill_rect(x + padding as f64, lower, width, upper - lower);
        }
    }

    fn interpolate(&self, other: &Self, percent: f64) -> Self {
        let candle = Candle {
            min: self.candle.min + (other.candle.min - self.candle.min) * percent,
            max: self.candle.max + (other.candle.max - self.candle.max) * percent,
            open: self.candle.open + (other.candle.open - self.candle.open) * percent,
            close: self.candle.close + (other.candle.close - self.candle.close) * percent,
            end: self.candle.end,
            start: self.candle.start,
        };
        let color = self.color.interpolate(&other.color, percent as f32);
        VisualCandle {
            candle,
            color,
            x: self.x + (other.x - self.x) * percent,
        }
    }
}

impl Default for Candle {
    fn default() -> Self {
        Candle::same(0.0, 0)
    }
}

impl Candle {
    pub fn new(min: f64, max: f64, open: f64, close: f64, start: u64, end: u64) -> Candle {
        Candle {
            min,
            max,
            open,
            close,
            start,
            end,
        }
    }

    pub fn from_arr(arr: &[f64]) -> Option<Candle> {
        let min = *arr.iter().min_by(|&a, &b| a.partial_cmp(b).unwrap())?;
        let max = *arr.iter().max_by(|&a, &b| a.partial_cmp(b).unwrap())?;
        let open = *arr.get(0)?;
        let close = *arr.get(3)?;
        Some(Candle::new(min, max, open, close, 0, 0))
    }

    pub fn random_walk(size: usize) -> Vec<Candle> {
        fn random_walk(size: usize) -> Vec<f64> {
            let mut v = vec![0.0; size];
            for i in 1..size {
                v[i] = v[i - 1] + js_sys::Math::random() - 0.5;
            }
            v
        }
        random_walk(size * 4)
            .chunks_exact(4)
            .map(|arr| Candle::from_arr(arr).unwrap_or_default())
            .collect()
    }

    pub fn to_visual(&self, index: usize, scale_x: &LinScale, scale_y: &LinScale) -> VisualCandle {
        let min = scale_y.apply(self.min);
        let max = scale_y.apply(self.max);
        let close = scale_y.apply(self.close);
        let open = scale_y.apply(self.open);
        let x = scale_x.apply(index as f64);
        let candle = Candle::new(min, max, close, open, self.start, self.end);
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

    pub fn same(val: f64, time: u64) -> Candle {
        Candle::new(val, val, val, val, time, time)
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
            start: a.start,
            end: b.end,
        }
    }
}

pub type MinMaxTree = SegmentPoint<Candle, MinMaxOp>;

#[derive(Clone, Debug, PartialEq)]
pub enum ChartKind {
    STICK,
    LINE,
    CANDLES,
}

#[derive(Clone, Debug, PartialEq)]
pub struct ChartView {
    pub candles: Vec<VisualCandle>,
    pub timescale: TimeScale,
    pub kind: ChartKind,
}

impl ChartView {
    pub fn from_visual_candles(candles: Vec<VisualCandle>, scale_x: LinScale) -> Self {
        let timescale = TimeScale::new(
            candles
                .iter()
                .map(|candle| {
                    NaiveDateTime::from_timestamp_millis(candle.candle.start as i64)
                        .expect("timestamp should be valid")
                })
                .collect(),
            scale_x,
        );
        Self {
            candles,
            timescale,
            kind: ChartKind::CANDLES,
        }
    }

    pub fn draw(&self, ctx: &CanvasRenderingContext2d) {
        match self.kind {
            ChartKind::LINE => self.draw_as_lines(ctx),
            ChartKind::STICK => self.draw_candles(ctx),
            ChartKind::CANDLES => self.draw_candles(ctx),
        }
        let canvas = ctx.canvas().expect("there should be a canvas");
        let width = canvas.width() as f64;
        let height = canvas.height() as f64;
        ctx.save();
        self.timescale.draw(&ctx, width, height);
        ctx.restore();
    }

    fn draw_candles(&self, ctx: &CanvasRenderingContext2d) {
        ctx.save();
        let canvas = ctx.canvas().expect("there should be a canvas");
        let width = canvas.width() as f64;
        let height = canvas.height() as f64;
        ctx.clear_rect(0.0, 0.0, width, height);
        let candle_width = dpr() * CANDLE_WIDTH;
        let padding = dpr() * CANDLE_PADDING;
        self.candles
            .iter()
            .for_each(|candle| candle.draw(ctx, candle_width, padding, &self.kind));
        ctx.restore();
    }

    fn draw_as_lines(&self, ctx: &CanvasRenderingContext2d) {
        ctx.save();
        let canvas = ctx.canvas().expect("there should be a canvas");
        let width = canvas.width() as f64;
        let height = canvas.height() as f64;
        ctx.clear_rect(0.0, 0.0, width, height);
        if let Some(first) = self.candles.first() {
            ctx.begin_path();
            ctx.move_to(first.x, first.candle.close);
            for candle in self.candles.iter().skip(1) {
                ctx.line_to(candle.x, candle.candle.close);
            }
        }
        ctx.stroke();
        ctx.restore();
    }
}

impl Default for ChartView {
    fn default() -> Self {
        Self {
            candles: Vec::new(),
            timescale: TimeScale::default(),
            kind: ChartKind::CANDLES,
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
    if range + delta_left + delta_right < MIN_RANGE {
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

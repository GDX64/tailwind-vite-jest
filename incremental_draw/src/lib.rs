use segment_tree::{ops::Operation, SegmentPoint};
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

const CANDLE_WIDTH: usize = 11;
const CANDLE_PADDING: usize = 3;
const CANDLE_REAL_WIDTH: usize = CANDLE_WIDTH - CANDLE_PADDING;

pub struct Chart {
    pub view_range: (usize, usize),
    pub scale_x: LinScale,
    pub scale_y: LinScale,
    pub ctx: CanvasRenderingContext2d,
    pub canvas_size: (u32, u32),
    pub view_data: Vec<(f64, Candle)>,
    last_draw_data: Vec<(f64, Candle)>,
    pub min_max_tree: MinMaxTree,
    pub avg_recalc_time: f64,
    size_updated: bool,
    curr_step: usize,
    should_draw: bool,
    last_draw_time: f64,
}

impl Chart {
    pub fn build(base_data: &[f64], ctx: CanvasRenderingContext2d) -> Chart {
        let base = base_data
            .iter()
            .map(|v| Candle::same(*v))
            .collect::<Vec<_>>();
        let min_max_tree = MinMaxTree::build(base, MinMaxOp);
        Chart {
            view_range: (0, base_data.len() / 2),
            scale_x: LinScale::new((0.0, 5.0), (0.0, 300.0)),
            scale_y: LinScale::new((0.0, 5.0), (0.0, 100.0)),
            ctx,
            canvas_size: (300, 150),
            view_data: vec![],
            last_draw_data: vec![],
            min_max_tree,
            curr_step: 1,
            size_updated: false,
            avg_recalc_time: 0.0,
            should_draw: false,
            last_draw_time: 0.0,
        }
    }

    fn dpr() -> f64 {
        web_sys::window()
            .map(|win| win.device_pixel_ratio())
            .unwrap_or(1.0)
    }

    pub fn query_range<'a>(&'a self) -> Candle {
        let (min, max) = self.view_range;
        self.min_max_tree.query_noiden(min, max)
    }

    pub fn get_size(&self) -> usize {
        self.min_max_tree.len()
    }

    pub fn adjust_canvas(&mut self) -> Option<()> {
        self.view_range = (
            self.view_range.0,
            self.view_range.1.min(self.min_max_tree.len()).max(10),
        );
        let canvas = self.ctx.canvas()?;
        let width = canvas.client_width() as u32;
        let height = canvas.client_height() as u32;
        let dpr = Self::dpr();
        self.canvas_size = (((width as f64) * dpr) as u32, (height as f64 * dpr) as u32);
        let (width, height) = self.canvas_size;
        canvas.set_width(width);
        canvas.set_height(height);
        Some(())
    }

    fn calc_base_data(&self) -> (impl ExactSizeIterator<Item = Candle> + '_, usize) {
        let (min, max) = self.view_range;
        let canvas_width = self.canvas_size.0;
        let max_candles = canvas_width as usize / CANDLE_WIDTH;
        let max_items_on_screen = max_candles.min(max - min);
        let range = max - min;
        let step = range / max_items_on_screen;
        let iter = (0..max_items_on_screen).map(move |i| {
            self.min_max_tree
                .query_noiden(min + i * step, min + (i + 1) * step)
        });
        (iter, step)
    }

    pub fn recalc(&mut self) {
        let start_time = js_sys::Date::now();
        if !self.size_updated {
            self.adjust_canvas();
            self.size_updated = true;
        }
        let (min, max) = self.view_range;
        let canvas_size = self.canvas_size.clone();
        let Candle { min, max, .. } = self.min_max_tree.query_noiden(min, max);
        let (data, step) = self.calc_base_data();
        let scale_y = LinScale::new((max, min), (5.0, canvas_size.1 as f64 - 5.0));
        let scale_x = LinScale::new((0 as f64, data.len() as f64), (0.0, canvas_size.0 as f64));
        self.view_data = data
            .enumerate()
            .map(|(i, min_max)| {
                let min = scale_y.apply(min_max.min);
                let max = scale_y.apply(min_max.max);
                let close = scale_y.apply(min_max.close);
                let open = scale_y.apply(min_max.open);
                let x = scale_x.apply(i as f64);
                (x, Candle::new(min, max, close, open))
            })
            .collect();
        self.scale_x = scale_x;
        self.scale_y = scale_y;
        self.curr_step = step;
        let end_time = js_sys::Date::now();
        self.avg_recalc_time = (end_time - start_time) * 0.1 + self.avg_recalc_time * 0.9;
        self.should_draw = true;
        self.last_draw_time = js_sys::Date::now();
    }

    pub fn draw(&mut self) {
        if !self.should_draw {
            return;
        }
        let time_percent = (js_sys::Date::now() - self.last_draw_time) / 64.0;
        let time_percent = time_percent.min(1.0);
        let ctx = &self.ctx;
        ctx.clear_rect(
            0.0,
            0.0,
            self.canvas_size.0 as f64,
            self.canvas_size.1 as f64,
        );
        ctx.begin_path();
        let val = JsValue::from_str("green");
        ctx.set_stroke_style(&val);
        ctx.set_fill_style(&val);
        if self.last_draw_data.len() != self.view_data.len() {
            self.last_draw_data = self.view_data.clone();
        }
        self.last_draw_data = self
            .view_data
            .iter()
            .zip(&self.last_draw_data)
            .map(|((x, now), (_, last))| (*x, last.interpolate(now, time_percent)))
            .collect();
        for (x, candle) in self.last_draw_data.iter() {
            if candle.is_positive() {
                candle.draw(ctx, *x);
            }
        }
        ctx.close_path();
        ctx.stroke();
        ctx.fill();
        ctx.begin_path();
        let val = JsValue::from_str("red");
        ctx.set_fill_style(&val);
        ctx.set_stroke_style(&val);
        for (x, candle) in self.last_draw_data.iter() {
            if !candle.is_positive() {
                candle.draw(ctx, *x);
            }
        }
        ctx.stroke();
        ctx.fill();
        if time_percent == 1.0 {
            self.should_draw = false;
        }
    }

    pub fn zoom(&mut self, delta: i32, center_point: f64) {
        let (min, max) = self.view_range;
        let point_index =
            ((self.scale_x.apply_inv(center_point * Self::dpr()) as usize) * self.curr_step) + min;
        let point_index = point_index.max(0).min(self.min_max_tree.len()) as i32;
        let min = min as i32;
        let max = max as i32;
        let range = max - min;
        let range_left = point_index - min;
        let range_right = max - point_index;
        let delta_left = (delta * range_left) / 100;
        let delta_right = (delta * range_right) / 100;
        let new_max = (max + delta_right)
            .max(point_index + 1)
            .min(self.get_size() as i32);
        let new_min = (min - delta_left).max(0).min(point_index - 1);
        if range + delta_left + delta_right < 10_000 {
            return;
        }
        self.view_range.0 = new_min.max(0) as usize;
        self.view_range.1 = new_max.min(self.get_size() as i32) as usize;
        self.recalc();
    }

    pub fn slide(&mut self, delta: i32) {
        let view_range = &mut self.view_range;
        let gap = (view_range.1 - view_range.0) as i32;
        let min = view_range.0 as i32 + (self.curr_step as i32) * delta;
        let min = min.max(0);
        let max = min + gap;
        if max > self.min_max_tree.len() as i32 {
            view_range.0 = self.min_max_tree.len() - gap as usize;
            view_range.1 = self.min_max_tree.len();
        } else {
            view_range.0 = min as usize;
            view_range.1 = max as usize;
        }
        self.recalc();
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

impl Candle {
    fn new(min: f64, max: f64, open: f64, close: f64) -> Candle {
        Candle {
            min,
            max,
            open,
            close,
        }
    }

    fn interpolate(&self, other: &Self, percent: f64) -> Self {
        Candle {
            min: self.min + (other.min - self.min) * percent,
            max: self.max + (other.max - self.max) * percent,
            open: self.open + (other.open - self.open) * percent,
            close: self.close + (other.close - self.close) * percent,
        }
    }

    fn draw(&self, ctx: &CanvasRenderingContext2d, x: f64) {
        ctx.rect(
            x + ((CANDLE_WIDTH + 1) / 2) as f64,
            self.max,
            1.0,
            (self.max - self.min).abs(),
        );
        let upper = self.open.max(self.close);
        let lower = self.open.min(self.close);
        let width = CANDLE_REAL_WIDTH as f64;
        ctx.rect(x + CANDLE_PADDING as f64, lower, width, upper - lower)
    }

    fn is_positive(&self) -> bool {
        self.close > self.open
    }

    fn same(val: f64) -> Candle {
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

#[cfg(test)]
mod test {
    use segment_tree::SegmentPoint;

    use crate::{Candle, MinMaxOp};

    #[test]
    fn test_segment_tree() {
        let example_minmax_vec = vec![
            Candle::same(1.0),
            Candle::same(2.0),
            Candle::same(3.0),
            Candle::same(4.0),
            Candle::same(5.0),
            Candle::same(6.0),
        ];

        let tree = SegmentPoint::build(example_minmax_vec, MinMaxOp);
        assert_eq!(tree.query_noiden(0, 6), Candle::new(1.0, 6.0, 0.0, 0.0));
    }
}

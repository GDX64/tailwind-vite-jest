use leptos::log;
use segment_tree::{
    ops::{Commutative, Identity, Operation},
    SegmentPoint,
};
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

pub struct Chart {
    pub view_range: (usize, usize),
    pub scale_x: LinScale,
    pub scale_y: LinScale,
    pub ctx: CanvasRenderingContext2d,
    pub canvas_size: (u32, u32),
    pub view_data: Vec<(f64, MinMax)>,
    pub min_max_tree: MinMaxTree,
}

impl Chart {
    pub fn build(base_data: &[f64], ctx: CanvasRenderingContext2d) -> Chart {
        let base = base_data
            .iter()
            .map(|v| MinMax::same(*v))
            .collect::<Vec<_>>();
        let min_max_tree = MinMaxTree::build(base, MinMaxOp);
        Chart {
            view_range: (0, base_data.len() / 2),
            scale_x: LinScale::new((0.0, 5.0), (0.0, 300.0)),
            scale_y: LinScale::new((0.0, 5.0), (0.0, 100.0)),
            ctx,
            canvas_size: (300, 150),
            view_data: vec![],
            min_max_tree,
        }
    }

    pub fn adjust_canvas(&mut self) -> Option<()> {
        self.view_range = (
            self.view_range.0,
            self.view_range.1.min(self.min_max_tree.len()).max(10),
        );
        let canvas = self.ctx.canvas()?;
        let width = canvas.client_width() as u32;
        let height = canvas.client_height() as u32;
        let dpi = web_sys::window()
            .map(|win| win.device_pixel_ratio())
            .unwrap_or(1.0);
        log!("dpi {:?}, ({width}, {height})", dpi);
        self.canvas_size = (((width as f64) * dpi) as u32, (height as f64 * dpi) as u32);
        let (width, height) = self.canvas_size;
        canvas.set_width(width);
        canvas.set_height(height);
        Some(())
    }

    fn calc_base_data(&self) -> Vec<MinMax> {
        let (min, max) = self.view_range;
        let max_items_on_screen = 300.min(max - min);
        let range = max - min;
        let step = range / max_items_on_screen;
        let v = (0..max_items_on_screen)
            .map(|i| {
                self.min_max_tree
                    .query(min + i * step, min + (i + 1) * step)
            })
            .collect::<Vec<_>>();
        v
    }

    pub fn recalc(&mut self) {
        self.adjust_canvas();
        log!("recalc, {:?}", self.canvas_size);
        let (min, max) = self.view_range;
        let data = self.calc_base_data();
        let MinMax { min, max } = self.min_max_tree.query(min, max);
        self.scale_y = LinScale::new((max, min), (5.0, self.canvas_size.1 as f64 - 5.0));
        self.scale_x = LinScale::new(
            (0 as f64, data.len() as f64),
            (0.0, self.canvas_size.0 as f64),
        );
        self.view_data = data
            .iter()
            .enumerate()
            .map(|(i, &min_max)| {
                let min = self.scale_y.apply(min_max.min);
                let max = self.scale_y.apply(min_max.max);

                let x = self.scale_x.apply(i as f64);
                (x, MinMax { min, max })
            })
            .collect();
    }

    pub fn draw(&self) {
        let ctx = &self.ctx;
        ctx.clear_rect(
            0.0,
            0.0,
            self.canvas_size.0 as f64,
            self.canvas_size.1 as f64,
        );
        ctx.begin_path();
        let val = JsValue::from_str("red");
        ctx.set_stroke_style(&val);
        for data_point in self.view_data.iter() {
            ctx.rect(
                data_point.0,
                data_point.1.max,
                1.0,
                (data_point.1.max - data_point.1.min).abs(),
            );
        }

        ctx.stroke();
    }
}

#[derive(PartialEq)]
pub struct LinScale {
    k: f64,
    alpha: f64,
}

impl LinScale {
    pub fn new(domain: (f64, f64), range: (f64, f64)) -> LinScale {
        let k = (range.1 - range.0) / (domain.1 - domain.0);
        let alpha = range.0 - k * domain.0;
        LinScale { k, alpha }
    }

    pub fn apply(&self, x: f64) -> f64 {
        self.k * x + self.alpha
    }
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct MinMax {
    pub min: f64,
    pub max: f64,
}

impl MinMax {
    fn new(min: f64, max: f64) -> MinMax {
        MinMax { min, max }
    }

    fn same(val: f64) -> MinMax {
        MinMax::new(val, val)
    }
}

struct MinMaxOp;

impl Operation<MinMax> for MinMaxOp {
    fn combine(&self, a: &MinMax, b: &MinMax) -> MinMax {
        MinMax {
            min: a.min.min(b.min),
            max: a.max.max(b.max),
        }
    }
}

impl Commutative<MinMax> for MinMaxOp {}

impl Identity<MinMax> for MinMaxOp {
    fn identity(&self) -> MinMax {
        MinMax {
            min: f64::MAX,
            max: f64::MIN,
        }
    }
}

pub type MinMaxTree = SegmentPoint<MinMax, MinMaxOp>;

#[cfg(test)]
mod test {
    use segment_tree::SegmentPoint;

    use crate::{MinMax, MinMaxOp};

    #[test]
    fn test_segment_tree() {
        let example_minmax_vec = vec![
            MinMax::same(1.0),
            MinMax::same(2.0),
            MinMax::same(3.0),
            MinMax::same(4.0),
            MinMax::same(5.0),
            MinMax::same(6.0),
        ];

        let tree = SegmentPoint::build(example_minmax_vec, MinMaxOp);
        assert_eq!(tree.query(0, 6), MinMax::new(1.0, 6.0));
    }
}

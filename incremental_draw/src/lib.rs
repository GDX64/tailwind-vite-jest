use leptos::log;
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

#[derive(PartialEq)]
pub struct Chart {
    pub base_data: Vec<f64>,
    pub view_range: (usize, usize),
    pub scale_x: LinScale,
    pub scale_y: LinScale,
    pub ctx: CanvasRenderingContext2d,
    pub canvas_size: (u32, u32),
    pub view_data: Vec<(f64, f64)>,
}

impl Chart {
    pub fn recalc(&mut self) {
        let (min, max) = self.view_range;
        self.scale_x = LinScale::new((min as f64, max as f64), (0.0, self.canvas_size.0 as f64));
        let data = &self.base_data[min..max];
        let (min, max) = data.iter().fold((f64::MAX, f64::MIN), |(min, max), &x| {
            (min.min(x), max.max(x))
        });
        self.scale_y = LinScale::new((min, max), (5.0, self.canvas_size.1 as f64 - 5.0));
        self.view_data = data
            .iter()
            .enumerate()
            .map(|(i, &x)| (self.scale_x.apply(i as f64), self.scale_y.apply(x)))
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
        if let Some(first_data_point) = self.view_data.first() {
            ctx.move_to(first_data_point.0, first_data_point.1);
            for data_point in self.view_data.iter().skip(1) {
                ctx.line_to(data_point.0, data_point.1);
            }
        }
        let val = JsValue::from_str("red");
        ctx.set_stroke_style(&val);
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

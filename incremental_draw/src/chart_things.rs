use crate::chart_core::{
    Candle, ChartView, DrawableChart, LinScale, MinMaxOp, MinMaxTree, VisualCandle, CANDLE_WIDTH,
};

pub struct Chart {
    pub view_range: (usize, usize),
    pub scale_x: LinScale,
    pub scale_y: LinScale,
    pub canvas_size: (u32, u32),
    pub view_data: Vec<(f64, Candle)>,
    pub min_max_tree: MinMaxTree,
    pub avg_recalc_time: f64,
    pub avg_redraw_time: f64,
    curr_step: usize,
    dirty: bool,
}

impl Chart {
    pub fn build(base_data: &[f64]) -> Chart {
        let base = base_data
            .iter()
            .map(|v| Candle::same(*v))
            .collect::<Vec<_>>();
        let min_max_tree = MinMaxTree::build(base, MinMaxOp);
        Chart {
            view_range: (0, base_data.len() / 2),
            scale_x: LinScale::new((0.0, 5.0), (0.0, 300.0)),
            scale_y: LinScale::new((0.0, 5.0), (0.0, 100.0)),
            canvas_size: (300, 150),
            view_data: vec![],
            min_max_tree,
            curr_step: 1,
            avg_recalc_time: 0.0,
            avg_redraw_time: 0.0,
            dirty: true,
        }
    }

    fn dpr() -> f64 {
        web_sys::window()
            .map(|win| win.device_pixel_ratio())
            .unwrap_or(1.0)
    }

    fn now() -> f64 {
        fn now_opt() -> Option<f64> {
            Some(web_sys::window()?.performance()?.now())
        }
        now_opt().unwrap_or(0.0)
    }

    pub fn query_range<'a>(&'a self) -> Candle {
        let (min, max) = self.view_range;
        self.min_max_tree.query_noiden(min, max)
    }

    pub fn get_size(&self) -> usize {
        self.min_max_tree.len()
    }

    pub fn adjust_canvas(&mut self, new_size: (u32, u32)) -> Option<()> {
        self.view_range = (
            self.view_range.0,
            self.view_range.1.min(self.min_max_tree.len()).max(10),
        );
        self.canvas_size = new_size;
        Some(())
    }

    fn calc_base_data(&self) -> (impl ExactSizeIterator<Item = Candle> + '_, usize) {
        let (min, max) = self.view_range;
        let canvas_width = self.canvas_size.0;
        let max_candles = (canvas_width as f64 / (CANDLE_WIDTH * Self::dpr())) as usize;
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
        let start_time = Self::now();
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
        self.avg_recalc_time = (Self::now() - start_time) * 0.1 + self.avg_recalc_time * 0.9;
    }

    fn calc_visual(&self) -> Vec<VisualCandle> {
        self.view_data
            .iter()
            .map(|(x, candle)| candle.to_visual(*x))
            .collect()
    }
}

impl DrawableChart for Chart {
    fn get_view(&mut self) -> ChartView {
        if self.dirty {
            self.recalc();
            self.dirty = false;
        }
        ChartView::from_visual_candles(self.calc_visual())
    }

    fn is_dirty(&self) -> bool {
        self.dirty
    }

    fn zoom(&mut self, delta: i32, center_point: f64) {
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
        self.dirty = true;
    }

    fn slide(&mut self, delta: i32) {
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
        self.dirty = true;
    }
}

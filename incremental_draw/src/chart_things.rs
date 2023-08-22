use crate::chart_core::{
    slide, update_zoom, Candle, ChartView, DrawableChart, LinScale, MinMaxOp, MinMaxTree,
    CANDLE_WIDTH,
};

pub struct Chart {
    pub view_range: (usize, usize),
    pub scale_x: LinScale,
    pub scale_y: LinScale,
    pub canvas_size: (u32, u32),
    pub min_max_tree: MinMaxTree,
    curr_step: usize,
    dirty: bool,
}

impl Chart {
    pub fn set_dirty(&mut self) {
        self.dirty = true;
    }

    pub fn build(size: usize) -> Chart {
        let mut date = 946692000000u64;
        let mut base_data = Candle::random_walk(size);
        base_data.iter_mut().for_each(|v| {
            v.start = date;
            date += 600_000;
            v.end = date;
        });
        leptos::log!("data generated, {}", base_data.len());
        let min_max_tree = MinMaxTree::build(base_data, MinMaxOp);
        Chart {
            view_range: (0, size / 2),
            scale_x: LinScale::new((0.0, 5.0), (0.0, 300.0)),
            scale_y: LinScale::new((0.0, 5.0), (0.0, 150.0)),
            canvas_size: (300, 150),
            min_max_tree,
            curr_step: 1,
            dirty: true,
        }
    }

    fn dpr() -> f64 {
        web_sys::window()
            .map(|win| win.device_pixel_ratio())
            .unwrap_or(1.0)
    }

    pub fn get_size(&self) -> usize {
        self.min_max_tree.len()
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
}

impl DrawableChart for Chart {
    fn get_view(&mut self) -> ChartView {
        let (min, max) = self.view_range;
        let canvas_size = self.canvas_size.clone();
        let Candle { min, max, .. } = self.min_max_tree.query_noiden(min, max);
        let (data, step) = self.calc_base_data();
        let scale_y = LinScale::new((max, min), (5.0, canvas_size.1 as f64 - 5.0));
        let scale_x = LinScale::new((0 as f64, data.len() as f64), (0.0, canvas_size.0 as f64));
        let view_data = data
            .enumerate()
            .map(|(i, candle)| candle.to_visual(i, &scale_x, &scale_y))
            .collect();
        self.scale_x = scale_x;
        self.scale_y = scale_y;
        self.curr_step = step;
        self.dirty = false;
        let view = ChartView::from_visual_candles(view_data, self.scale_x.clone());
        view
    }

    fn set_canvas_size(&mut self, size: (u32, u32)) {
        self.canvas_size = size;
        self.dirty = true;
    }

    fn is_dirty(&self) -> bool {
        self.dirty
    }

    fn zoom(&mut self, delta: i32, center_point: f64) {
        let data_size = self.get_size();
        self.view_range = update_zoom(
            self.view_range,
            delta,
            center_point,
            self.curr_step,
            data_size,
            &self.scale_x,
        );
        self.dirty = true;
    }

    fn slide(&mut self, delta: i32) {
        let data_size = self.get_size();
        self.view_range = slide(self.view_range, delta, self.curr_step, data_size);
        self.dirty = true;
    }
}

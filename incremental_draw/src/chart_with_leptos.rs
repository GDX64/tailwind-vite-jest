use leptos::{
    create_memo, create_rw_signal, Memo, RwSignal, Scope, SignalGet, SignalUpdate, SignalWith,
};

use crate::chart_core::{
    dpr, update_zoom, Candle, ChartView, DrawableChart, LinScale, MinMaxOp, MinMaxTree,
    CANDLE_WIDTH,
};

pub struct LeptosChart {
    view_data: Memo<ChartView>,
    canvas_size: RwSignal<(u32, u32)>,
    view_range: RwSignal<(usize, usize)>,
    data_step: Memo<(Vec<Candle>, usize)>,
    data_size: Memo<usize>,
    scales: Memo<(LinScale, LinScale)>,
}

impl LeptosChart {
    pub fn build(base_data: &[f64], cx: Scope) -> LeptosChart {
        let base = base_data
            .iter()
            .map(|v| Candle::same(*v))
            .collect::<Vec<_>>();
        let min_max_tree = MinMaxTree::build(base, MinMaxOp);
        let canvas_size = create_rw_signal(cx, (100u32, 100u32));
        let view_range = create_rw_signal(cx, (0usize, min_max_tree.len() / 2));
        let min_max_tree = create_rw_signal(cx, min_max_tree);
        let data_size = create_memo(cx, move |_| min_max_tree.with(|tree| tree.len()));
        let data_step = create_memo(cx, move |_| {
            min_max_tree.with(move |tree| {
                let (min, max) = view_range.get();
                let sizes = canvas_size.get();

                let (data, step) = calc_base_data((min, max), sizes, tree);
                (data, step)
            })
        });
        let scales = create_memo(cx, move |_| {
            // LinScale::new((0.0, 5.0), (0.0, 300.0))
            let (width, height) = canvas_size.get();
            let (min, max) = view_range.get();
            let Candle { min, max, .. } = min_max_tree.with(|tree| tree.query_noiden(min, max));
            let data_size = data_step.with(|(data, _)| data.len());
            // leptos::log!("{:?} / {:?}", data.len(), view_range.get());
            let scale_x = LinScale::new((0 as f64, data_size as f64), (0.0, width as f64));
            let scale_y = LinScale::new((max as f64, min as f64), (5.0, height as f64 - 5.0));
            (scale_x, scale_y)
        });

        let view_data = create_memo(cx, move |_| {
            let (scale_x, scale_y) = scales.get();
            let data = data_step.with(move |(data, _)| {
                data.iter()
                    .enumerate()
                    .map(|(i, candle)| candle.to_visual(i, &scale_x, &scale_y))
                    .collect::<Vec<_>>()
            });
            ChartView::from_visual_candles(data)
        });
        LeptosChart {
            view_data,
            canvas_size,
            view_range,
            data_step,
            data_size,
            scales,
        }
    }
}

fn calc_base_data(
    (min, max): (usize, usize),
    (canvas_width, _): (u32, u32),
    min_max_tree: &MinMaxTree,
) -> (Vec<Candle>, usize) {
    let max_candles = (canvas_width as f64 / (CANDLE_WIDTH * dpr())) as usize;
    let max_items_on_screen = max_candles.min(max - min);
    let range = max - min;
    let step = range / max_items_on_screen;
    let data: Vec<Candle> = (0..max_items_on_screen)
        .map(move |i| min_max_tree.query_noiden(min + i * step, min + (i + 1) * step))
        .collect();
    (data, step)
}

impl DrawableChart for LeptosChart {
    fn get_view(&mut self) -> ChartView {
        self.view_data.get()
    }

    fn is_dirty(&self) -> bool {
        true
    }

    fn set_canvas_size(&mut self, size_now: (u32, u32)) {
        self.canvas_size.update(|size| *size = size_now);
    }

    fn zoom(&mut self, delta: i32, center_point: f64) {
        let step = self.data_step.with(|(_, step)| *step);
        let data_size = self.data_size.get();
        let (scale_x, _) = self.scales.get();
        self.view_range.update(|range| {
            *range = update_zoom(*range, delta, center_point, step, data_size, &scale_x);
            leptos::log!("{:?}", *range);
        });
    }

    fn slide(&mut self, delta: i32) {}
}

use std::{fmt::Debug, rc::Rc};

use web_sys::CanvasRenderingContext2d;

use super::{Computed, SignalLike};
use crate::my_sigs as gsig;

pub fn create_draw(
    range: gsig::Signal<(usize, usize)>,
    data: gsig::Signal<Vec<f64>>,
    dims: gsig::Signal<(f64, f64)>,
) -> impl SignalLike<Value = Drawable> {
    // log("draw made");
    let in_range = gsig::and_2(&range, &data, |range, data| {
        let &(begin, end) = range;
        (begin.max(0), end.min(data.len()))
    });
    let scales = {
        let (in_range, data, dims) = (in_range.clone(), data.clone(), dims.clone());
        gsig::Computed::new(move |waker| {
            let data = data.get(waker);
            let dims = dims.get(waker);
            let (begin, end) = *in_range.get(waker);
            if let Some((y_min, y_max)) = LineChart::min_max(&data[begin..end]) {
                let (w, h) = *dims;
                let scale_x = Scale::from((begin as f64, end as f64), (0.0, w));
                let scale_y = Scale::from((y_min, y_max), (0.0, h));
                return Some((scale_x, scale_y));
            }
            None
        })
    };
    let scaled_data = gsig::and_3(&scales, &data, &in_range, |scales, data, &(begin, end)| {
        if let Some((scale_x, scale_y)) = scales {
            let mapped = data[begin..end]
                .iter()
                .enumerate()
                .map(|(index, point)| (scale_x.apply(index as f64), scale_y.apply(*point)))
                .collect::<Vec<_>>();

            return Rc::new(mapped);
        }
        Rc::new(vec![])
    });
    Computed::new(move |waker| -> Drawable {
        let scaled_data = scaled_data.get(waker).clone();
        let dims = dims.get(waker);
        let (w, h) = *dims;
        Box::new(move |ctx: &CanvasRenderingContext2d| {
            ctx.clear_rect(0.0, 0.0, w, h);
            ctx.begin_path();
            ctx.move_to(0.0, 0.0);
            let step = (scaled_data.len() / (1_000)).max(1);
            scaled_data.iter().step_by(step).for_each(|(x, y)| {
                ctx.line_to(*x, *y);
            });
            ctx.stroke();
        })
    })
}

struct LineChart {}

impl LineChart {
    fn min_max(v: &[f64]) -> Option<(f64, f64)> {
        if v.len() < 1 {
            return None;
        }
        let mut acc_y = (v[0], v[0]);
        v.iter().for_each(|item| {
            acc_y = (acc_y.0.min(*item), acc_y.1.max(*item));
        });
        Some(acc_y)
    }
}

#[derive(Debug, PartialEq)]
struct Scale {
    alpha: f64,
    k: f64,
}

impl Scale {
    fn apply(&self, x: f64) -> f64 {
        self.alpha * x + self.k
    }

    fn from(domain: (f64, f64), image: (f64, f64)) -> Scale {
        let alpha = (image.1 - image.0) / (domain.1 - domain.0);
        Scale {
            alpha,
            k: image.0 - domain.0 * alpha,
        }
    }
}

type Drawable = Box<dyn Fn(&CanvasRenderingContext2d)>;

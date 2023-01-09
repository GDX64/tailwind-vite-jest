use std::{fmt::Debug, rc::Rc};
use web_sys::CanvasRenderingContext2d;

use super::{Computed, SignalLike};
use crate::my_sigs as gsig;

pub fn create_draw(
    range: gsig::Signal<(usize, usize)>,
    data: gsig::Signal<Vec<gsig::Signal<f64>>>,
    dims: gsig::Signal<(f64, f64)>,
    average_size: gsig::Signal<i32>,
) -> impl SignalLike<Value = Drawable> {
    // log("draw made");
    let agregated_data = {
        let data = data.clone();
        gsig::Computed::new(move |waker| {
            let data = data.get(waker);
            let average_size = *average_size.get(waker);
            let comps: Vec<_> = data
                .windows(average_size as usize)
                .map(|window| {
                    let sigs = window.to_vec();
                    let comp = gsig::Computed::new(move |waker| {
                        sigs.iter().fold(0.0, |acc, now| acc + *now.get(waker))
                    });
                    comp
                })
                .collect();
            comps
        })
    };

    let in_range = gsig::and_2(&range, &agregated_data, |range, data| {
        let &(begin, end) = range;
        (begin.max(0).min(data.len()), end.min(data.len()).max(0))
    });

    let scales = {
        let (in_range, agregated_data, dims) =
            (in_range.clone(), agregated_data.clone(), dims.clone());
        gsig::Computed::new(move |waker| {
            let agregated_data = agregated_data.get(waker);
            let dims = dims.get(waker);
            let (begin, end) = *in_range.get(waker);
            let mut line_iter = agregated_data[begin..end].iter().map(|sig| *sig.get(waker));
            if let Some(data) = LineChart::min_max(&mut line_iter) {
                let (w, h) = *dims;
                let scale_x = Scale::from((begin as f64, end as f64), (0.0, w));
                let scale_y = Scale::from((data.min.1, data.max.1), (h, 0.0));
                return Some((scale_x, scale_y));
            }
            None
        })
    };
    let scaled_data = {
        let (agregated_data, scales, in_range) =
            (agregated_data.clone(), scales.clone(), in_range.clone());
        gsig::Computed::new(move |waker| {
            let scales: &Option<_> = &scales.get(waker);
            let agregated_data: &Vec<_> = &agregated_data.get(waker);
            let (begin, end) = *in_range.get(waker);
            if let Some((scale_x, scale_y)) = scales {
                let mapped = agregated_data[begin..end]
                    .iter()
                    .enumerate()
                    .map(|(index, point)| {
                        (
                            scale_x.apply(index as f64),
                            scale_y.apply(*point.get(waker)),
                        )
                    })
                    .collect::<Vec<_>>();

                return Rc::new(mapped);
            }
            Rc::new(vec![])
        })
    };
    Computed::new(move |waker| -> Drawable {
        let scaled_data = scaled_data.get(waker).clone();
        let dims = dims.get(waker);
        let (w, h) = *dims;
        Box::new(move |ctx: &CanvasRenderingContext2d| {
            ctx.clear_rect(0.0, 0.0, w, h);
            if scaled_data.len() == 0 {
                return;
            }
            ctx.begin_path();
            ctx.move_to(scaled_data[0].0, scaled_data[0].1);
            let step = (scaled_data.len() / (1_000)).max(1);
            if step > 1 {
                scaled_data.chunks(step).for_each(|slice| {
                    let mut iter = slice.iter().map(|xy| xy.1);
                    if let Some(data) = LineChart::min_max(&mut iter) {
                        ctx.line_to(slice[data.min.0].0, data.min.1);
                        ctx.line_to(slice[data.max.0].0, data.max.1);
                    }
                });
            } else {
                scaled_data.iter().for_each(|&(x, y)| ctx.line_to(x, y))
            }
            ctx.stroke();
        })
    })
}

struct LineChart {}

impl LineChart {
    fn min_max(v: &mut impl Iterator<Item = f64>) -> Option<MinMaxData> {
        if let Some(init) = v.next() {
            let mut data = MinMaxData {
                min: (0, init),
                max: (0, init),
            };
            v.enumerate().for_each(|(index, item)| {
                if item < data.min.1 {
                    data.min.1 = item;
                    data.min.0 = index + 1;
                }
                if item > data.max.1 {
                    data.max.1 = item;
                    data.max.0 = index + 1;
                }
            });
            return Some(data);
        }
        return None;
    }
}

struct MinMaxData {
    min: (usize, f64),
    max: (usize, f64),
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

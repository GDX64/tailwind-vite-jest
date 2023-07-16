use anchors::singlethread::*;

pub fn testing() {
    // example
    let mut engine = Engine::new();

    let data_points = Var::new(vec![1, 2, 3, 10, 0]).watch();
    let desired_view_slice = Var::new((0, 5)).watch();
    let canvas_size = Var::new((100, 100)).watch();
    let real_slice = (&data_points, &desired_view_slice).map(|data_points, desired_view_slice| {
        let min = desired_view_slice.0;
        let max = desired_view_slice.1;
        let max = std::cmp::min(max, data_points.len());
        (min, max)
    });

    let min_max_data = (&data_points, &real_slice).map(|data, view| {
        data[view.0..view.1]
            .iter()
            .fold((i32::MAX, i32::MIN), |(min, max), &x| {
                (std::cmp::min(min, x), std::cmp::max(max, x))
            })
    });

    let xy_scale =
        (&min_max_data, &real_slice, &canvas_size).map(|(min, max), view, (canvas_x, canvas_y)| {
            let scale_x = Scale::new(
                (view.0 as f64, view.1 as f64 - 1.0),
                (0.0, *canvas_x as f64),
            );
            let scale_y = Scale::new((*min as f64, *max as f64), (*canvas_y as f64, 0.0));
            (scale_x, scale_y)
        });

    let scaled_view_data =
        (&data_points, &xy_scale, &real_slice).map(|data, (scale_x, scale_y), view| {
            data[view.0..view.1]
                .iter()
                .enumerate()
                .map(|(index, item)| {
                    let x = scale_x.apply(index as f64);
                    let y = scale_y.apply(*item as f64);
                    (x, y)
                })
                .collect::<Vec<_>>()
        });

    let scaled_view = engine.get(&scaled_view_data);
    assert_eq!(scaled_view[1], (25.0, 80.0));
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct Scale {
    k: f64,
    b: f64,
}

impl Scale {
    fn apply(&self, x: f64) -> f64 {
        self.k * x + self.b
    }

    fn new((domain_min, domain_max): (f64, f64), (range_min, range_max): (f64, f64)) -> Scale {
        let k = (range_max - range_min) / (domain_max - domain_min);
        let b = range_min - k * domain_min;
        Scale { k, b }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_anchors() {}
}

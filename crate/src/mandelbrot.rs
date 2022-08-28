use std::ops::{Add, Mul};
use wasm_bindgen::prelude::*;

#[derive(Copy, Clone)]
struct Complex {
    r: f64,
    i: f64,
}

impl Complex {
    fn module(&self) -> f64 {
        return self.i * self.i + self.r * self.r;
    }
}

impl Mul for Complex {
    type Output = Complex;
    fn mul(self, rhs: Self) -> Self::Output {
        Complex {
            r: self.r * rhs.r - self.i * rhs.i,
            i: self.r * rhs.i + rhs.i * self.r,
        }
    }
}

impl Add for Complex {
    type Output = Complex;
    fn add(self, rhs: Self) -> Self::Output {
        Complex {
            r: self.r + rhs.r,
            i: self.i + rhs.i,
        }
    }
}

const N: usize = 50;

fn calc_score(c: &Complex) -> f64 {
    let mut acc = Complex { r: 0.0, i: 0.0 };
    for i in 0..N {
        acc = acc * acc + *c;
        if acc.module() > 4.0 {
            return i as f64 / N as f64;
        }
    }
    return 1 as f64;
}

struct Scale {
    alpha: f64,
    k: f64,
}

impl Scale {
    fn apply(&self, x: f64) -> f64 {
        self.alpha * x + self.k
    }
    fn new(from: (f64, f64), to: (f64, f64)) -> Scale {
        let alpha = (to.1 - to.0) / (from.1 - from.0);
        let k = to.0 - from.0 * alpha;
        Scale { alpha, k }
    }
}

#[wasm_bindgen]
pub fn calc_set(width: usize, heigth: usize, region: &[f64]) -> Vec<u8> {
    if let [x0, x1, y0, y1] = region {
        let mut image = vec![255u8; width * heigth * 4];
        let scale_x = Scale::new((0 as f64, width as f64), (*x0, *x1));
        let scale_y = Scale::new((heigth as f64, 0 as f64), (*y0, *y1));
        for j in 0..heigth {
            for i in 0..width {
                let score = calc_score(&Complex {
                    r: scale_x.apply(i as f64),
                    i: scale_y.apply(j as f64),
                });
                let color = ((1.0 - score) * 255.0).round();
                let index_now = j * width * 4 + i * 4;
                image[index_now] = 0;
                image[index_now + 1] = 0;
                image[index_now + 2] = 0;
                image[index_now + 3] = color as u8;
            }
        }
        return image;
    }
    return vec![];
}

#[cfg(test)]
mod test {
    use super::calc_set;

    #[test]
    fn sanity() {
        assert_eq!(16, calc_set(2, 2, &vec![1.0, 1.0, 1.0, 1.0]).len());
    }
}

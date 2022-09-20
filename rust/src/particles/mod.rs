mod euler;
use self::euler::Euler;
use super::random;
use nalgebra::{Matrix2xX, Vector2, VectorSlice2};
use wasm_bindgen::prelude::*;

type Mat = Matrix2xX<f64>;
type V2 = Vector2<f64>;
type V2Slice<'a> = VectorSlice2<'a, f64>;

#[wasm_bindgen]
pub struct ParticleWorld {
    euler: Euler<Mat, fn(&Mat, &Mat, f64) -> Mat>,
}

#[wasm_bindgen]
pub fn random_world(max_x: f64, max_y: f64, number_of_particles: usize) -> ParticleWorld {
    let v = (0..number_of_particles).flat_map(|_| {
        return [random() * max_x, random() * max_y];
    });
    let matrix = Mat::from_iterator(number_of_particles, v);
    let euler = Euler {
        x: matrix,
        v: Mat::zeros(number_of_particles),
        t: 0.0,
        dt: 0.1,
        dv: calc_acc as fn(&Mat, &Mat, f64) -> Mat,
    };
    ParticleWorld { euler }
}

#[wasm_bindgen]
impl ParticleWorld {
    pub fn evolve(&mut self) {
        self.euler.evolve();
    }

    pub fn points(&self) -> Vec<f64> {
        let data = &self.euler.x.data;
        data.as_vec().clone()
    }

    pub fn speed(&self) -> Vec<f64> {
        let data = &self.euler.v.data;
        data.as_vec().clone()
    }
}

const CENTER_FORCE: f64 = 1.5;
const DAMPING: f64 = 0.1;
const CENTER: V2 = V2::new(400.0, 400.0);

fn calc_acc(position: &Mat, speed: &Mat, _: f64) -> Mat {
    let mut result = Mat::zeros(position.ncols());
    position.column_iter().enumerate().for_each(|(i, col)| {
        let mut acc = base_influence(&col);
        acc += speed.column(i) * -DAMPING; //speed damping
        position
            .column_iter()
            .enumerate()
            .filter(|(j, _)| *j != i)
            .for_each(|(_, other)| acc += influence(&col, &other));
        result.set_column(i, &acc);
    });
    result
}

fn influence(point: &V2Slice, reference: &V2Slice) -> V2 {
    let r = point - reference;
    let norm_sq = r.norm_squared();
    if norm_sq == 0.0 {
        r
    } else {
        r.normalize() * (1.0 / r.norm_squared()).clamp(0.0, 50.0) * 80.0
    }
}

fn base_influence(point: &V2Slice) -> V2 {
    let r = CENTER - point;
    let norm = r.norm();
    if norm == 0.0 {
        r
    } else {
        r.normalize() * norm.min(1.0) * CENTER_FORCE
    }
}

#[cfg(test)]
mod test {
    use std::borrow::BorrowMut;

    use crate::particles::random_world;

    use super::Mat;
    #[test]
    fn test() {
        let mut world = random_world(10.0, 10.0, 2);
        {
            let x = world.euler.x.borrow_mut();
            x[0] = 1.0;
        }
        world.evolve();
        println!("{:?}", world.euler.x);
    }

    #[test]
    fn test_norm() {
        let n = Mat::from_row_slice(&[0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
        n.column_iter()
            .enumerate()
            .for_each(|col| println!("{:?}", col))
    }
}

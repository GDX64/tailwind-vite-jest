mod euler;
use std::borrow::BorrowMut;

use self::euler::Euler;
use super::random;
use nalgebra::{Matrix2xX, Vector2, VectorSlice2};
use wasm_bindgen::prelude::*;

type Mat = Matrix2xX<f64>;
type V2 = Vector2<f64>;
type V2Slice<'a> = VectorSlice2<'a, f64>;

#[wasm_bindgen]
pub struct ParticleWorld {
    euler: Euler<Mat>,
    calc: ParticleWorldCalc,
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
    };
    ParticleWorld {
        euler,
        calc: ParticleWorldCalc {
            center: V2::new(400.0, 400.0),
            repulsion: 200.0,
            center_force: 1.5,
        },
    }
}

#[wasm_bindgen]
impl ParticleWorld {
    pub fn evolve(&mut self) {
        let euler = self.euler.borrow_mut();
        let calc = &self.calc;
        euler.evolve(|pos: &Mat, speed: &Mat, _: f64| calc.calc_acc(pos, speed));
    }

    pub fn points(&self) -> Vec<f64> {
        let data = &self.euler.x.data;
        data.as_vec().clone()
    }

    pub fn speed(&self) -> Vec<f64> {
        let data = &self.euler.v.data;
        data.as_vec().clone()
    }

    pub fn set_center(&mut self, x: f64, y: f64) {
        self.calc.center = V2::new(x, y);
    }

    pub fn set_forces(&mut self, repulsion: f64, center: f64) {
        self.calc.repulsion = repulsion;
        self.calc.center_force = center;
    }
}

struct ParticleWorldCalc {
    center: V2,
    repulsion: f64,
    center_force: f64,
}

impl ParticleWorldCalc {
    fn calc_acc(&self, position: &Mat, speed: &Mat) -> Mat {
        let mut result = Mat::zeros(position.ncols());
        position.column_iter().enumerate().for_each(|(i, col)| {
            let mut acc = self.base_influence(&col);
            acc += speed.column(i) * -DAMPING; //speed damping
            position
                .column_iter()
                .for_each(|other| acc += self.influence(&col, &other));
            result.set_column(i, &acc);
        });
        result
    }

    fn influence(&self, point: &V2Slice, reference: &V2Slice) -> V2 {
        let r = point - reference;
        let norm_sq = r.norm_squared();
        if norm_sq == 0.0 {
            r
        } else {
            r.normalize() * (self.repulsion / r.norm_squared()).clamp(0.0, 50.0)
        }
    }

    fn base_influence(&self, point: &V2Slice) -> V2 {
        let r = self.center - point;
        let norm = r.norm();
        if norm == 0.0 {
            r
        } else {
            r.normalize() * norm.min(1.0) * self.center_force
        }
    }
}

const DAMPING: f64 = 0.1;

#[cfg(test)]
mod test {
    use std::borrow::BorrowMut;

    use crate::particles::random_world;

    use super::Mat;
    #[test]
    fn test() {
        let mut world = random_world(500.0, 500.0, 500);
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

    #[test]
    fn space_filling() {
        use space_time::zorder;
        let z = zorder::z_2::Z2::new(15, 15);
        println!("value is {}", z.z())
    }
}

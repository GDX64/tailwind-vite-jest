mod euler;

use self::euler::Mat4;

use super::random;
use euler::{euler_evolve, V4};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ParticleWorld {
    x: Vec<V4>,
    v: Vec<V4>,
    projection_mat: Mat4,
    calc: ParticleWorldCalc,
}

#[wasm_bindgen]
pub fn random_world(max_x: f32, max_y: f32, number_of_particles: usize) -> ParticleWorld {
    let v = (0..number_of_particles).map(|_| {
        return V4::xyz(
            random() as f32 * max_x,
            random() as f32 * max_y,
            400.0 * random() as f32,
        );
    });

    ParticleWorld {
        x: v.collect(),
        v: vec![V4::xyz(0.0, 0.0, 0.0); number_of_particles],
        projection_mat: Mat4::identity(),
        calc: ParticleWorldCalc {
            center: V4::xyz(0.0, 0.0, 0.0),
            repulsion: 200.0,
            center_force: 1.5,
        },
    }
}

#[wasm_bindgen]
impl ParticleWorld {
    pub fn evolve(&mut self) {
        let acc = self.calc.calc_acc(&self.x, &self.v);
        self.x.iter_mut().enumerate().for_each(|(i, x)| {
            let v = &mut self.v[i];
            let a = &acc[i];
            euler_evolve(x, v, a, 0.1);
        });
    }

    pub fn rotate(&mut self, angle_x: f32, angle_y: f32) {
        let v_rotated = Mat4::rotate_y(angle_y).v_mul(&V4::xyz(0.0, 0.0, 1_000.0));
        let v_rotated = Mat4::rotate_x(angle_x).v_mul(&v_rotated);
        let translate = Mat4::translation_mat(400.0, 400.0, 0.0);
        self.projection_mat = translate.mul(&Mat4::orthogonal_projection(&v_rotated));
    }

    pub fn points(&self) -> Vec<f32> {
        self.x
            .iter()
            .flat_map(|v| {
                let v = self.projection_mat.v_mul(v);
                [v.x(), v.y()]
            })
            .collect::<Vec<f32>>()
    }

    pub fn speed(&self) -> Vec<f32> {
        self.v
            .iter()
            .flat_map(|v| [v.x(), v.y()])
            .collect::<Vec<f32>>()
    }

    pub fn set_center(&mut self, x: f32, y: f32) {
        self.calc.center = V4::xyz(x, y, 0.0);
    }

    pub fn set_forces(&mut self, repulsion: f32, center: f32) {
        self.calc.repulsion = repulsion;
        self.calc.center_force = center;
    }
}

struct ParticleWorldCalc {
    center: V4,
    repulsion: f32,
    center_force: f32,
}

impl ParticleWorldCalc {
    #[inline(never)]
    fn calc_acc(&self, position: &Vec<V4>, speed: &Vec<V4>) -> Vec<V4> {
        position
            .iter()
            .enumerate()
            .map(|(i, x)| {
                let mut acc = self.base_influence(&x);
                acc.add_mut(&speed[i].mul_scalar(-DAMPING)); //speed damping
                position
                    .iter()
                    .for_each(|other| acc.add_mut(&self.influence(&x, &other)));
                acc
            })
            .collect()
    }

    fn influence(&self, point: &V4, reference: &V4) -> V4 {
        let r = point.sub(reference);
        let norm_sq = r.norm_squared();
        if norm_sq == 0.0 {
            r
        } else {
            r.normalize()
                .mul_scalar((self.repulsion / r.norm_squared()).clamp(0.0, 50.0))
        }
    }

    fn base_influence(&self, point: &V4) -> V4 {
        let r = self.center.sub(point);
        let norm = r.norm();
        if norm == 0.0 {
            r
        } else {
            r.normalize().mul_scalar(norm.min(1.0) * self.center_force)
        }
    }
}

const DAMPING: f32 = 0.1;

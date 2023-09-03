mod euler;

use super::random;
use euler::{euler_evolve, V2};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ParticleWorld {
    x: Vec<V2>,
    v: Vec<V2>,
    calc: ParticleWorldCalc,
}

#[wasm_bindgen]
pub fn random_world(max_x: f32, max_y: f32, number_of_particles: usize) -> ParticleWorld {
    let v = (0..number_of_particles).map(|_| {
        return V2::new(random() as f32 * max_x, random() as f32 * max_y);
    });

    ParticleWorld {
        x: v.collect(),
        v: vec![V2::new(0.0, 0.0); number_of_particles],
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
        let acc = self.calc.calc_acc(&self.x, &self.v);
        self.x.iter_mut().enumerate().for_each(|(i, x)| {
            let v = &mut self.v[i];
            let a = &acc[i];
            euler_evolve(x, v, a, 0.1);
        });
    }

    pub fn points(&self) -> Vec<f32> {
        self.x.iter().flat_map(|v| [v.x, v.y]).collect::<Vec<f32>>()
    }

    pub fn speed(&self) -> Vec<f32> {
        self.v.iter().flat_map(|v| [v.x, v.y]).collect::<Vec<f32>>()
    }

    pub fn set_center(&mut self, x: f32, y: f32) {
        self.calc.center = V2::new(x, y);
    }

    pub fn set_forces(&mut self, repulsion: f32, center: f32) {
        self.calc.repulsion = repulsion;
        self.calc.center_force = center;
    }
}

struct ParticleWorldCalc {
    center: V2,
    repulsion: f32,
    center_force: f32,
}

impl ParticleWorldCalc {
    fn calc_acc(&self, position: &Vec<V2>, speed: &Vec<V2>) -> Vec<V2> {
        position
            .iter()
            .enumerate()
            .map(|(i, x)| {
                let mut acc = self.base_influence(&x);
                acc = acc.add(&speed[i].mul_scalar(-DAMPING)); //speed damping
                position
                    .iter()
                    .for_each(|other| acc = acc.add(&self.influence(&x, &other)));
                acc
            })
            .collect()
    }

    fn influence(&self, point: &V2, reference: &V2) -> V2 {
        let r = point.sub(reference);
        let norm_sq = r.norm_squared();
        if norm_sq == 0.0 {
            r
        } else {
            r.normalize()
                .mul_scalar((self.repulsion / r.norm_squared()).clamp(0.0, 50.0))
        }
    }

    fn base_influence(&self, point: &V2) -> V2 {
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

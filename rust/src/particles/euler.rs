use std::ops::{Add, AddAssign, Mul};
extern crate nalgebra as na;
pub trait Evolvable<T> {
    fn evolve(&mut self);
    fn get_x(&self) -> &T;
}

#[derive(Debug)]
pub struct Euler<T, F>
where
    F: Fn(&T, &T, f64) -> T,
{
    pub t: f64,
    pub dt: f64,
    pub x: T,
    pub v: T,
    pub dv: F,
}

impl<T, F> Evolvable<T> for Euler<T, F>
where
    F: Fn(&T, &T, f64) -> T,
    T: Add<T, Output = T> + AddAssign + Mul<f64, Output = T> + Clone,
{
    fn evolve(&mut self) {
        let dv = (self.dv)(&self.x, &self.v, self.t) * (self.dt);
        self.v += dv;
        let dx = self.v.clone() * self.dt;
        self.x += dx;
        self.t += self.dt;
    }

    fn get_x(&self) -> &T {
        &self.x
    }
}

#[derive(Clone, Debug)]
struct V2 {
    x: f64,
    y: f64,
}

impl Add for V2 {
    type Output = V2;
    fn add(mut self, rhs: Self) -> Self::Output {
        self.x += rhs.x;
        self.y += rhs.y;
        self
    }
}

impl AddAssign for V2 {
    fn add_assign(&mut self, rhs: Self) {
        self.x += rhs.x;
        self.y += rhs.y;
    }
}

impl Mul<f64> for V2 {
    type Output = V2;
    fn mul(mut self, rhs: f64) -> Self::Output {
        self.x *= rhs;
        self.y *= rhs;
        self
    }
}

#[cfg(test)]
mod test {
    use crate::particles::euler::Evolvable;

    use super::{Euler, V2};

    #[test]
    fn test() {
        let mut euler = Euler {
            t: 0.0,
            dt: 0.1,
            x: V2 { x: 1.0, y: 1.0 },
            v: V2 { x: 0.0, y: 0.0 },
            dv: |x: &V2, _: &V2, _: f64| x.clone() * -1.0,
        };
        euler.evolve();
        println!("{:?}", euler.x);
    }

    #[test]
    fn test_matrix() {
        use nalgebra::Matrix3 as Mat;
        let mut euler = Euler {
            x: Mat::identity(),
            v: Mat::default(),
            t: 0.0,
            dt: 0.1,
            dv: |x: &Mat<f64>, _: &Mat<f64>, _: f64| x.clone() * -1.0,
        };
        euler.evolve();
        println!("{:?}", euler.x);
    }
}

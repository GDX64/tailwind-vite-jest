use std::ops::{Add, AddAssign, Mul};

#[derive(Debug)]
pub struct Euler<T, F>
where
    F: Fn(&T, &T, f64) -> T,
{
    t: f64,
    dt: f64,
    x: T,
    v: T,
    dv: F,
}

impl<T, F> Euler<T, F>
where
    F: Fn(&T, &T, f64) -> T,
    T: Add<T, Output = T> + AddAssign + Mul<f64, Output = T> + Clone,
{
    fn evolve(&mut self) -> &mut Self {
        let dv = (self.dv)(&self.x, &self.v, self.t) * (self.dt);
        self.v += dv;
        let dx = self.v.clone() * self.dt;
        self.x += dx;
        self.t += self.dt;
        self
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
}

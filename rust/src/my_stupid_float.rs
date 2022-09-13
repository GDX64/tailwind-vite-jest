use std::ops::{Add, AddAssign, Mul};

#[derive(Debug)]
struct Euler<T, F>
where
    F: Fn(&T, f64) -> T,
{
    t: f64,
    dt: f64,
    x: T,
    f: F,
}

impl<T, F> Euler<T, F>
where
    F: Fn(&T, f64) -> T,
    T: Add<T, Output = T> + AddAssign + Mul<f64, Output = T>,
{
    fn evolve(&mut self) -> &mut Self {
        let dx = (self.f)(&self.x, self.t) * (self.dt);
        self.t += self.dt;
        self.x += dx;
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
            f: |x: &V2, _: f64| x.clone() * -1.0,
        };
        euler.evolve();
        println!("{:?}", euler.x);
    }
}

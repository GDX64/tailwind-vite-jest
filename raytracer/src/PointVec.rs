use std::ops::{Add, Mul, Sub};

#[derive(Debug, Clone, Copy)]
pub struct Point {
    x: f64,
    y: f64,
    z: f64,
    w: f64,
}

impl Point {
    fn new(x: f64, y: f64, z: f64) -> Self {
        Point { x, y, z, w: 1.0 }
    }
}

const EPS: f64 = 1e-6;

impl PartialEq for Point {
    fn eq(&self, other: &Self) -> bool {
        (self.x - other.x).abs() < EPS
            && (self.y - other.y).abs() < EPS
            && (self.z - other.z).abs() < EPS
            && (self.w - other.w).abs() < EPS
    }
}

impl Add<V3D> for Point {
    type Output = Self;
    fn add(self, rhs: V3D) -> Self::Output {
        Point {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z,
            w: self.w,
        }
    }
}

impl Sub for Point {
    type Output = V3D;
    fn sub(self, rhs: Self) -> Self::Output {
        V3D {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
            z: self.z - rhs.z,
        }
    }
}

impl Sub<V3D> for Point {
    type Output = Self;
    fn sub(self, rhs: V3D) -> Self::Output {
        Point {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
            z: self.z - rhs.z,
            w: self.w,
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct V3D {
    x: f64,
    y: f64,
    z: f64,
}

impl V3D {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        V3D { x, y, z }
    }
}

impl Add for V3D {
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        V3D {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z,
        }
    }
}

impl Sub for V3D {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        V3D {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
            z: self.z - rhs.z,
        }
    }
}

impl Mul for V3D {
    type Output = f64;
    fn mul(self, rhs: Self) -> Self::Output {
        self.x * rhs.x + self.y * rhs.y + self.z * rhs.z
    }
}

impl PartialEq for V3D {
    fn eq(&self, other: &Self) -> bool {
        (self.x - other.x).abs() < EPS
            && (self.y - other.y).abs() < EPS
            && (self.z - other.z).abs() < EPS
    }
}

impl V3D {
    fn cross(&self, other: &Self) -> Self {
        V3D {
            x: self.y * other.z - self.z * other.y,
            y: self.z * other.x - self.x * other.z,
            z: self.x * other.y - self.y * other.x,
        }
    }

    fn magnitude(&self) -> f64 {
        (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
    }

    fn normalize(&self) -> Self {
        let mag = self.magnitude();
        V3D {
            x: self.x / mag,
            y: self.y / mag,
            z: self.z / mag,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_dot_product() {
        let a = V3D::new(1.0, 2.0, 3.0);
        let b = V3D::new(2.0, 3.0, 4.0);
        assert_eq!(a * b, 20.0);
    }

    #[test]
    fn test_sum_vec_and_point() {
        let a = V3D::new(1.0, 2.0, 3.0);
        let b = Point::new(2.0, 3.0, 4.0);
        let result = b + a;
        assert_eq!(result, Point::new(3.0, 5.0, 7.0));
    }

    #[test]
    fn sub_points() {
        let a = Point::new(1.0, 2.0, 3.0);
        let b = Point::new(2.0, 3.0, 4.0);
        let result = a - b;
        assert_eq!(result, V3D::new(-1.0, -1.0, -1.0));
    }

    #[test]
    fn cross_product() {
        let a = V3D::new(1.0, 2.0, 3.0);
        let b = V3D::new(2.0, 3.0, 4.0);
        let result = a.cross(&b);
        assert_eq!(result, V3D::new(-1.0, 2.0, -1.0));
    }
}

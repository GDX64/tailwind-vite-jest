use std::ops::{Add, Div, Mul, Neg, Sub};

use crate::point_vec::{Point, TupleLike};

pub trait MatTraits:
    Div<Self, Output = Self>
    + Sub<Self, Output = Self>
    + Add<Self, Output = Self>
    + Mul<Self, Output = Self>
    + Default
    + Copy
    + Clone
    + HasOne
    + NearZero
    + Neg<Output = Self>
    + Trigonometric
{
}

#[derive(Debug, Clone, PartialEq)]
pub struct Mat4<T: MatTraits> {
    data: [T; 16],
}

pub trait HasOne {
    fn one() -> Self;
}

pub trait Trigonometric {
    fn sin(&self) -> Self;
    fn cos(&self) -> Self;
}

pub trait NearZero {
    fn near_zero(&self) -> bool;
}

impl HasOne for i32 {
    fn one() -> Self {
        1
    }
}

impl<T: MatTraits> Mat4<T> {
    fn new() -> Mat4<T> {
        Mat4 {
            data: [T::default(); 16],
        }
    }

    pub fn translation(x: T, y: T, z: T) -> Mat4<T> {
        let mut mat = Mat4::identity();
        mat.data[12] = x;
        mat.data[13] = y;
        mat.data[14] = z;
        mat
    }

    pub fn scaling(x: T, y: T, z: T) -> Mat4<T> {
        let mut mat = Mat4::identity();
        mat.data[0] = x;
        mat.data[5] = y;
        mat.data[10] = z;
        mat
    }

    pub fn rotation_x(r: T) -> Mat4<T> {
        let mut mat = Mat4::identity();
        mat.data[5] = r.cos();
        mat.data[6] = -r.sin();
        mat.data[9] = r.sin();
        mat.data[10] = r.cos();
        mat
    }

    pub fn rotation_z(r: T) -> Mat4<T> {
        let mut mat = Mat4::identity();
        mat.data[0] = r.cos();
        mat.data[1] = -r.sin();
        mat.data[4] = r.sin();
        mat.data[5] = r.cos();
        mat
    }

    pub fn identity() -> Mat4<T> {
        let mut mat = Mat4::new();
        mat.data[0] = T::one();
        mat.data[5] = T::one();
        mat.data[10] = T::one();
        mat.data[15] = T::one();
        mat
    }

    pub fn transpose(&self) -> Mat4<T> {
        let mut mat = Mat4::new();
        for i in 0..4 {
            for j in 0..4 {
                mat.data[i * 4 + j] = self.data[j * 4 + i];
            }
        }
        mat
    }

    pub fn inverse(&self) -> Option<Mat4<T>> {
        let mut mat = Mat4::new();
        let a00 = self.data[0];
        let a01 = self.data[1];
        let a02 = self.data[2];
        let a03 = self.data[3];
        let a10 = self.data[4];
        let a11 = self.data[5];
        let a12 = self.data[6];
        let a13 = self.data[7];
        let a20 = self.data[8];
        let a21 = self.data[9];
        let a22 = self.data[10];
        let a23 = self.data[11];
        let a30 = self.data[12];
        let a31 = self.data[13];
        let a32 = self.data[14];
        let a33 = self.data[15];
        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if det.near_zero() {
            return None;
        }
        let det = T::one() / det;
        mat.data[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        mat.data[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        mat.data[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        mat.data[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        mat.data[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        mat.data[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        mat.data[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        mat.data[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        mat.data[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        mat.data[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        mat.data[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        mat.data[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        mat.data[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        mat.data[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        mat.data[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        mat.data[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        Some(mat)
    }

    pub fn mul_ref(&self, rhs: &Mat4<T>) -> Mat4<T> {
        let mut mat = Mat4::new();
        for i in 0..4 {
            for j in 0..4 {
                mat.data[i + j * 4] = self.data[i] * rhs.data[4 * j]
                    + self.data[i + 4] * rhs.data[4 * j + 1]
                    + self.data[i + 8] * rhs.data[4 * j + 2]
                    + self.data[i + 12] * rhs.data[4 * j + 3];
            }
        }
        mat
    }
}

impl Mat4<f64> {
    pub fn mul_vec(&self, rhs: &Point) -> Point {
        let mut out = [0.0; 4];
        for i in 0..4 {
            out[i] = self.data[i] * rhs.x
                + self.data[i + 4] * rhs.y
                + self.data[i + 8] * rhs.z
                + self.data[i + 12] * rhs.w;
        }
        Point::new(out[0], out[1], out[2])
    }
}

impl Mat4<f64> {
    pub fn mul_tuple<V: TupleLike>(&self, rhs: &V) -> V {
        let mut out = [0.0; 4];
        for i in 0..4 {
            out[i] = self.data[i] * rhs.get_x()
                + self.data[i + 4] * rhs.get_y()
                + self.data[i + 8] * rhs.get_z()
                + self.data[i + 12] * rhs.get_w();
        }
        V::from_tuple((out[0], out[1], out[2], out[3]))
    }
}

impl<T: MatTraits> Mul for Mat4<T> {
    type Output = Mat4<T>;

    fn mul(self, rhs: Mat4<T>) -> Mat4<T> {
        self.mul_ref(&rhs)
    }
}

impl HasOne for f32 {
    fn one() -> Self {
        1.0
    }
}

impl HasOne for f64 {
    fn one() -> Self {
        1.0
    }
}

impl NearZero for f64 {
    fn near_zero(&self) -> bool {
        self.abs() < 1e-6
    }
}

impl NearZero for f32 {
    fn near_zero(&self) -> bool {
        self.abs() < 1e-6
    }
}

impl Trigonometric for f32 {
    fn sin(&self) -> Self {
        f32::sin(*self)
    }

    fn cos(&self) -> Self {
        f32::cos(*self)
    }
}
impl Trigonometric for f64 {
    fn sin(&self) -> Self {
        f64::sin(*self)
    }

    fn cos(&self) -> Self {
        f64::cos(*self)
    }
}

impl MatTraits for f32 {}
impl MatTraits for f64 {}

impl<T: TupleLike> Mul<T> for Mat4<f64> {
    type Output = T;
    fn mul(self, rhs: T) -> Self::Output {
        self.mul_tuple(&rhs)
    }
}

#[cfg(test)]
mod test {
    use crate::matrices::Mat4;

    #[test]
    fn mul_test() {
        let m = Mat4::<f32>::identity();
        let mut m2 = m.clone();
        m2.data[0] = 2.0;
        m2.data[1] = 3.0;
        let m = m.clone() * m2.clone();
        assert_eq!(m, m2);
    }

    #[test]
    fn inverse() {
        let m = Mat4::<f32>::identity();
        let inverse = m.inverse().unwrap();
        assert_eq!(m, inverse);
    }

    #[test]
    fn does_not_have_inverse() {
        let m = Mat4::<f32>::new();
        let inverse = m.inverse();
        assert_eq!(None, inverse);
    }

    #[test]
    fn small_ints_inverse() {
        let mut m = Mat4::<f32>::identity();
        m.data[0] = 5.0;
        m.data[1] = 2.0;
        m.data[2] = 3.0;
        let identity = m.inverse().map(|inv| inv * m);
        assert_eq!(Some(Mat4::<f32>::identity()), identity);
    }
}

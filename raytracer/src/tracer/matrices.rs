use std::ops::{Add, Mul};

trait MatTraits:
    Add<Self, Output = Self> + Mul<Self, Output = Self> + Default + Copy + Clone + HasOne
{
}

#[derive(Debug, Clone, PartialEq)]
struct Mat4<T: MatTraits> {
    data: [T; 16],
}

trait HasOne {
    fn one() -> Self;
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

    fn identity() -> Mat4<T> {
        let mut mat = Mat4::new();
        mat.data[0] = T::one();
        mat.data[5] = T::one();
        mat.data[10] = T::one();
        mat.data[15] = T::one();
        mat
    }

    fn mul_ref(&self, rhs: &Mat4<T>) -> Mat4<T> {
        let mut mat = Mat4::new();
        for i in 0..4 {
            for j in 0..4 {
                mat.data[i * 4 + j] = self.data[i * 4] * rhs.data[j]
                    + self.data[i * 4 + 1] * rhs.data[j + 4]
                    + self.data[i * 4 + 2] * rhs.data[j + 8]
                    + self.data[i * 4 + 3] * rhs.data[j + 12];
            }
        }
        mat
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

impl MatTraits for f32 {}
impl MatTraits for f64 {}

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
}

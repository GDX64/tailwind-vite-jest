pub fn euler_evolve(x: &mut V4, v: &mut V4, acc: &V4, dt: f32) {
    let dv = acc.mul_scalar(dt);
    let new_v = dv.add(v);
    *v = new_v;
    let dx = v.mul_scalar(dt);
    *x = dx.add(x);
}

use std::arch::wasm32::{f32x4_add, f32x4_extract_lane, f32x4_mul, f32x4_splat, f32x4_sub, v128};

pub union V4 {
    v: v128,
    arr: [f32; 4],
}

impl Clone for V4 {
    fn clone(&self) -> Self {
        unsafe { Self { v: self.v } }
    }
}

impl V4 {
    pub fn x(&self) -> f32 {
        unsafe { self.arr[0] }
    }

    pub fn y(&self) -> f32 {
        unsafe { self.arr[1] }
    }

    pub fn z(&self) -> f32 {
        unsafe { self.arr[2] }
    }

    pub fn xyz(x: f32, y: f32, z: f32) -> Self {
        Self {
            arr: [x, y, z, 1.0],
        }
    }

    pub fn new(x: f32, y: f32, z: f32, w: f32) -> Self {
        Self { arr: [x, y, z, w] }
    }

    pub fn mul_scalar(&self, scalar: f32) -> Self {
        unsafe {
            Self {
                v: f32x4_mul(self.v, f32x4_splat(scalar)),
            }
        }
    }

    pub fn add(&self, other: &Self) -> Self {
        unsafe {
            Self {
                v: f32x4_add(self.v, other.v),
            }
        }
    }

    pub fn sub(&self, other: &Self) -> Self {
        unsafe {
            Self {
                v: f32x4_sub(self.v, other.v),
            }
        }
    }

    pub fn dot(&self, other: &Self) -> f32 {
        unsafe {
            let mul = f32x4_mul(self.v, other.v);
            f32x4_extract_lane::<0>(mul)
                + f32x4_extract_lane::<1>(mul)
                + f32x4_extract_lane::<2>(mul)
                + f32x4_extract_lane::<3>(mul)
        }
    }

    pub fn norm(&self) -> f32 {
        self.dot(self).sqrt()
    }

    pub fn normalize(&self) -> Self {
        self.mul_scalar(1.0 / self.norm())
    }

    pub fn norm_squared(&self) -> f32 {
        self.dot(self)
    }

    pub fn add_mut(&mut self, other: &Self) {
        unsafe {
            self.v = f32x4_add(self.v, other.v);
        }
    }
}

pub struct Mat4 {
    rows: [V4; 4],
}

impl Mat4 {
    pub fn identity() -> Self {
        Self {
            rows: [
                V4::new(1.0, 0.0, 0.0, 0.0),
                V4::new(0.0, 1.0, 0.0, 0.0),
                V4::new(0.0, 0.0, 1.0, 0.0),
                V4::new(0.0, 0.0, 0.0, 1.0),
            ],
        }
    }

    pub fn v_mul(&self, v: &V4) -> V4 {
        V4::new(
            self.rows[0].dot(v),
            self.rows[1].dot(v),
            self.rows[2].dot(v),
            self.rows[3].dot(v),
        )
    }

    pub fn rotate_y(angle: f32) -> Self {
        let mut mat = Self::identity();
        let cos = angle.cos();
        let sin = angle.sin();
        mat.rows[0] = V4::xyz(cos, 0.0, sin);
        mat.rows[2] = V4::xyz(-sin, 0.0, cos);
        mat
    }

    pub fn rotate_x(angle: f32) -> Self {
        let mut mat = Self::identity();
        let cos = angle.cos();
        let sin = angle.sin();
        mat.rows[1] = V4::xyz(0.0, cos, -sin);
        mat.rows[2] = V4::xyz(0.0, sin, cos);
        mat
    }

    pub fn translation_mat(x: f32, y: f32, z: f32) -> Self {
        let mut mat = Self::identity();
        mat.rows[3] = V4::new(x, y, z, 1.0);
        mat.transpose()
    }

    pub fn transpose(&self) -> Self {
        let mut mat = Self::identity();
        mat.rows[0] = V4::xyz(self.rows[0].x(), self.rows[1].x(), self.rows[2].x());
        mat.rows[1] = V4::xyz(self.rows[0].y(), self.rows[1].y(), self.rows[2].y());
        mat.rows[2] = V4::xyz(self.rows[0].z(), self.rows[1].z(), self.rows[2].z());
        mat
    }

    pub fn mul(&self, other: &Self) -> Self {
        let mut mat = Self::identity();
        mat.rows[0] = self.v_mul(&other.rows[0]);
        mat.rows[1] = self.v_mul(&other.rows[1]);
        mat.rows[2] = self.v_mul(&other.rows[2]);
        mat.rows[3] = self.v_mul(&other.rows[3]);
        mat
    }

    pub fn orthogonal_projection(plane: &V4) -> Self {
        let mut mat = Self::identity();
        let plane = plane.normalize();
        let x = plane.x();
        let y = plane.y();
        let z = plane.z();
        mat.rows[0] = V4::xyz(1.0 - x * x, -x * y, -x * z);
        mat.rows[1] = V4::xyz(-y * x, 1.0 - y * y, -y * z);
        mat.rows[2] = V4::xyz(-z * x, -z * y, 1.0 - z * z);
        mat
    }
}

use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn pass() {
    assert_eq!(1, 1);
}

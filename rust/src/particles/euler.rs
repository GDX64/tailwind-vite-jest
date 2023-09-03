pub fn euler_evolve(x: &mut V3, v: &mut V3, acc: &V3, dt: f32) {
    let dv = acc.mul_scalar(dt);
    let new_v = dv.add(v);
    *v = new_v;
    let dx = v.mul_scalar(dt);
    *x = dx.add(x);
}

use std::arch::wasm32::{f32x4_add, f32x4_extract_lane, f32x4_mul, f32x4_splat, f32x4_sub, v128};

pub union V3 {
    v: v128,
    arr: [f32; 4],
}

impl Clone for V3 {
    fn clone(&self) -> Self {
        unsafe { Self { v: self.v } }
    }
}

impl V3 {
    pub fn x(&self) -> f32 {
        unsafe { self.arr[0] }
    }

    pub fn y(&self) -> f32 {
        unsafe { self.arr[1] }
    }

    pub fn z(&self) -> f32 {
        unsafe { self.arr[2] }
    }

    pub fn new(x: f32, y: f32, z: f32) -> Self {
        Self {
            arr: [x, y, z, 0.0],
        }
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
            f32x4_extract_lane::<1>(mul)
                + f32x4_extract_lane::<0>(mul)
                + f32x4_extract_lane::<2>(mul)
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

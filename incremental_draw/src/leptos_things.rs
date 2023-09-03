use leptos::*;

pub fn leptos_main() {
    leptos::mount_to_body(|cx| {
        let calc = || {
            let v = VecSIMD::new([1.0, 2.0, 3.0, 4.0]);
            let res = v.norm_sq();
            let simd_mul = format!("{res:?}");
            simd_mul
        };
        view! {cx,
            <div>
                <h1>"SIMD Mul"</h1>
                <p>{calc()}</p>
            </div>
        }
    })
}

use std::{
    arch::wasm32::{f32x4_mul, v128},
    fmt::Debug,
};

#[repr(C)]
union VecSIMD {
    pub v: v128,
    pub a: [f32; 4],
}

impl Debug for VecSIMD {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let a = unsafe { &self.a };
        write!(f, "Vec128 {{ a: {:?} }}", a)
    }
}

impl VecSIMD {
    pub fn new(a: [f32; 4]) -> Self {
        Self { a }
    }

    pub fn norm_sq(&self) -> f32 {
        unsafe {
            let v = f32x4_mul(self.v, self.v);
            let res = VecSIMD { v };
            res.a.iter().sum()
        }
    }
}

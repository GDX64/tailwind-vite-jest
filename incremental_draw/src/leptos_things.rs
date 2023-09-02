use leptos::*;

pub fn leptos_main() {
    leptos::mount_to_body(|cx| {
        let calc = || {
            let main_res = main();
            let simd_mul = format!("{main_res:?}");
            simd_mul
        };
        let (res, write_res) = create_signal(cx, "".to_string());
        view! {cx,
            <div on:click=move |_|{
                write_res.set(calc());
            }>
                <h1>"SIMD Mul"</h1>
                <p>{res}</p>
            </div>
        }
    })
}

use std::arch::wasm32::{i16x8_mul, v128};

fn mul_simd(x: v128, y: v128) -> v128 {
    i16x8_mul(x, y)
}

fn main() -> [i16; 8] {
    let a: [i16; 8] = [1, 2, 3, 4, 5, 6, 7, 8];
    let b: [i16; 8] = [1, 2, 3, 4, 5, 6, 7, 8];

    let res: [i16; 8] = unsafe {
        let vec_a: v128 = ::std::mem::transmute(a);
        let vec_b: v128 = ::std::mem::transmute(b);
        let vec_c: v128 = mul_simd(vec_a, vec_b);
        ::std::mem::transmute(vec_c)
    };
    res
}

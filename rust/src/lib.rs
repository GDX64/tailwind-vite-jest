pub mod hilbert;
pub mod mandelbrot;
pub mod particles;
pub mod wordleMod;

use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    pub fn random() -> f64;
}

#[cfg(not(target_arch = "wasm32"))]
pub fn random() -> f64 {
    0.0
}

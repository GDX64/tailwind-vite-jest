pub mod hilbert;
pub mod mandelbrot;
mod particles;
pub mod wordleMod;

use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    pub fn random() -> f64;
}

pub mod hilbert;
pub mod mandelbrot;
pub mod particles;
pub mod wordleMod;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    pub fn random() -> f64;

    #[wasm_bindgen(js_namespace = console)]
    pub fn log(str: &str);
}

#[cfg(not(target_arch = "wasm32"))]
pub fn random() -> f64 {
    rand::random()
}

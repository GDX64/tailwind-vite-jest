use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(str: &str);
    #[wasm_bindgen(js_namespace = Math)]
    pub fn random() -> f64;
}

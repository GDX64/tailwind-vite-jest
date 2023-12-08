#![feature(portable_simd)]
mod math;
mod rasterizer;
use math::point_vec::{Point, V3D};
pub use math::*;
pub use rasterizer::TriangleRaster;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const TYPESCRIPT_TYPES: &'static str = r#"
interface TriangleInfo {
    p1: [number, number, number];
    p2: [number, number, number];
    p3: [number, number, number];
    width: number;
    height: number;
}

interface TimeResult {
    simd: number;
    no_simd: number;
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "TriangleInfo")]
    pub type TriangleInfoJs;
    #[wasm_bindgen(typescript_type = "TimeResult")]
    pub type TimeResultJs;
}

#[derive(Serialize, Deserialize)]
pub struct TriangleInfo {
    pub p1: [f64; 3],
    pub p2: [f64; 3],
    pub p3: [f64; 3],
    pub width: usize,
    pub height: usize,
}

#[derive(Serialize, Deserialize)]
pub struct TimeResult {
    pub simd: f64,
    pub no_simd: f64,
}

#[wasm_bindgen]
pub fn raster_triangle(info: TriangleInfoJs, canvas_vec: &mut [u32]) -> TimeResultJs {
    let info = serde_wasm_bindgen::from_value::<TriangleInfo>(info.obj).unwrap();
    canvas_vec.iter_mut().for_each(|c| *c = 0xffaaaaaau32);
    let width = info.width;
    let raster = TriangleRaster::new();
    let triangle: [V3D; 3] = [
        Point::from(&info.p1[..]).into(),
        Point::from(&info.p2[..]).into(),
        Point::from(&info.p3[..]).into(),
    ];
    let simd = measure_time(|| {
        raster.rasterize_simd(&triangle, canvas_vec, width);
    });
    let no_simd = measure_time(|| {
        let mut count = 0;
        raster.rasterize(&triangle, |x, y| {
            count += 1;
        });
        count
    });
    let result = TimeResult { simd, no_simd };
    let jsvalue = serde_wasm_bindgen::to_value(&result).unwrap();
    TimeResultJs { obj: jsvalue }
}

fn measure_time<T>(mut f: impl FnMut() -> T) -> f64 {
    let start = web_sys::js_sys::Date::now();
    let n = 100;
    for _ in 0..n {
        std::hint::black_box(f());
    }
    let end = web_sys::js_sys::Date::now();
    let avg_time = (end - start) / n as f64;
    // log_str(format!("Elapsed: {:?}", avg_time));
    avg_time
}

pub fn log_str(s: impl Into<String>) {
    let s: String = s.into();
    web_sys::console::log_1(&JsValue::from_str(&s));
}

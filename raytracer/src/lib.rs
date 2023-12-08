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
    simd: string;
    no_simd: string;
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
    pub simd: String,
    pub no_simd: String,
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
        raster.rasterize(&triangle, canvas_vec, width);
    });
    let result = TimeResult { simd, no_simd };
    let jsvalue = serde_wasm_bindgen::to_value(&result).unwrap();
    TimeResultJs { obj: jsvalue }
}

fn measure_time<T>(mut f: impl FnMut() -> T) -> String {
    let n = 20;
    let times: Vec<f64> = (0..n)
        .map(|_| {
            let start = web_sys::js_sys::Date::now();
            std::hint::black_box(f());
            let end = web_sys::js_sys::Date::now();
            end - start
        })
        .collect();

    let avg_time = times.iter().sum::<f64>() / n as f64;
    let sum_squared = times
        .into_iter()
        .map(|t| (t - avg_time).powi(2))
        .sum::<f64>();
    let std_dev = (sum_squared / n as f64).sqrt();
    let std_error = std_dev / (n as f64).sqrt();
    let std_error_percent = std_error / avg_time * 100.0;

    let formated_result = format!("{:.2}ms ± {:.1}%", avg_time, std_error_percent);
    // log_str(format!("Elapsed: {:?}", avg_time));
    formated_result
}

pub fn log_str(s: impl Into<String>) {
    let s: String = s.into();
    web_sys::console::log_1(&JsValue::from_str(&s));
}

#![feature(portable_simd)]
mod math;
mod rasterizer;
use gloo_utils::format::JsValueSerdeExt;
use math::{
    matrices::Mat4,
    point_vec::{Point, V3D},
};
pub use rasterizer::*;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct TriangleInfo {
    pub p1: [f64; 3],
    pub p2: [f64; 3],
    pub p3: [f64; 3],
    pub width: usize,
    pub height: usize,
}

#[wasm_bindgen]
pub fn raster_triangle(info: JsValue, canvas_vec: &mut [u32]) -> Option<f64> {
    let info = JsValueSerdeExt::into_serde::<TriangleInfo>(&info).ok()?;
    let width = info.width;
    let raster = TriangleRaster::new();
    let transform = Mat4::translation(300.0, 200.0, 0.0);
    let triangle: [V3D; 3] = [
        transform.mul_tuple(&Point::from(&info.p1[..])).into(),
        transform.mul_tuple(&Point::from(&info.p2[..])).into(),
        transform.mul_tuple(&Point::from(&info.p3[..])).into(),
    ];
    raster.rasterize_simd(&triangle, |x, y| {
        let index = ((y as usize) * width + (x as usize)) * 4;
        canvas_vec.get_mut(index).map(|c| *c = 0xff0000u32);
    });
    let avg_time = measure_time(|| {
        let mut count = 0;
        raster.rasterize_simd(&triangle, |x, y| {
            count += 1;
        });
        count
    });
    Some(avg_time)
}

fn measure_time<T>(mut f: impl FnMut() -> T) -> f64 {
    let start = web_sys::js_sys::Date::now();
    let n = 1000;
    for _ in 0..n {
        std::hint::black_box(f());
    }
    let end = web_sys::js_sys::Date::now();
    let avg_time = (end - start) / n as f64;
    log_str(format!("Elapsed: {:?}", avg_time));
    avg_time
}

fn log_str(s: impl Into<String>) {
    let s: String = s.into();
    web_sys::console::log_1(&JsValue::from_str(&s));
}

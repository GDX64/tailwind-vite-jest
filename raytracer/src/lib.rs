#![feature(portable_simd)]
mod math;
mod rasterizer;
use math::{
    matrices::Mat4,
    point_vec::{Point, V3D},
};
pub use rasterizer::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn raster_triangle(width: usize, height: usize, canvas_vec: &mut [u32]) {
    let raster = TriangleRaster::new();
    let transform = Mat4::translation(300.0, 200.0, 0.0);
    let triangle: [V3D; 3] = [
        transform.mul_tuple(&Point::new(0.0, 0.0, 0.0)).into(),
        transform.mul_tuple(&Point::new(-200.0, 400.0, 0.0)).into(),
        transform.mul_tuple(&Point::new(200.0, 400.0, 0.0)).into(),
    ];
    raster.rasterize_simd(&triangle, |x, y| {
        let index = ((y as usize) * width + (x as usize)) * 4;
        canvas_vec.get_mut(index).map(|c| *c = 0xff0000u32);
    });
}

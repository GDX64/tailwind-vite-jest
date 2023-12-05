use raytracer::{
    canvas::Canvas,
    matrices::Mat4,
    point_vec::{Point, V3D},
    TriangleRaster,
};

fn main() {
    let mut canvas = Canvas::new(800, 800);
    let raster = TriangleRaster::new();
    let transform = Mat4::translation(300.0, 200.0, 0.0);
    let triangle: [V3D; 3] = [
        transform.mul_tuple(&Point::new(0.0, 0.0, 0.0)).into(),
        transform.mul_tuple(&Point::new(-200.0, 400.0, 0.0)).into(),
        transform.mul_tuple(&Point::new(200.0, 400.0, 0.0)).into(),
    ];
    raster.rasterize_simd(&triangle, |x, y| canvas.write(x, y, 0xff0000u32));
    let count = measure_time(|| {
        let mut count = 0usize;
        raster.rasterize(&triangle, |x, y| count += 1);
        raster.rasterize(&triangle, |x, y| count += 1);
        raster.rasterize(&triangle, |x, y| count += 1);
        raster.rasterize(&triangle, |x, y| count += 1);
        count
    });
    let count2 = measure_time(|| {
        let mut count = 0usize;
        raster.rasterize_simd(&triangle, |x, y| count += 1);
        raster.rasterize_simd(&triangle, |x, y| count += 1);
        raster.rasterize_simd(&triangle, |x, y| count += 1);
        raster.rasterize_simd(&triangle, |x, y| count += 1);
        count
    });
    println!("count1 {}, count2 {}", count, count2);
    canvas.loop_until_exit();
}

fn measure_time<T>(f: impl FnOnce() -> T) -> T {
    let start = std::time::Instant::now();
    let result = f();
    println!("Elapsed: {:?}", start.elapsed());
    result
}

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
    measure_time(|| {
        let mut count = 0usize;
        raster.rasterize(&triangle, |x, y| count += 1);
        count
    });
    measure_time(|| {
        let mut count = 0usize;
        raster.rasterize_simd(&triangle, |x, y| count += 1);
        count
    });
    canvas.loop_until_exit();
}

fn measure_time<T>(f: impl Fn() -> T) {
    let start = std::time::Instant::now();
    let n = 1000;
    for _ in 0..n {
        std::hint::black_box(f());
    }
    println!("Elapsed: {:?}", start.elapsed() / n);
}

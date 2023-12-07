use raytracer::{
    point_vec::{Point, V3D},
    TriangleRaster,
};
use tracer::canvas::Canvas;
mod tracer;

fn main() {
    let mut canvas = Canvas::new(1504, 1504);
    let raster = TriangleRaster::new();
    let triangle: [V3D; 3] = [
        Point::new((canvas.width / 2) as f64, 0.0, 0.0).into(),
        Point::new(0.0, canvas.height as f64, 0.0).into(),
        Point::new(canvas.width as f64, canvas.height as f64, 0.0).into(),
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
    let n = 100;
    for _ in 0..n {
        std::hint::black_box(f());
    }
    println!("Elapsed: {:?}", start.elapsed() / n);
}

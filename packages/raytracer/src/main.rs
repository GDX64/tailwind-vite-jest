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
    measure_time(|| {
        raster.rasterize(&triangle, &mut canvas.pixels, canvas.width, 0xffaaaaaau32);
    });
    measure_time(|| {
        raster.rasterize_simd(&triangle, &mut canvas.pixels, canvas.width, 0xffaaaaaau32);
    });
    canvas.loop_until_exit();
}

fn measure_time<T>(mut f: impl FnMut() -> T) {
    let start = std::time::Instant::now();
    let n = 100;
    for _ in 0..n {
        std::hint::black_box(f());
    }
    println!("Elapsed: {:?}", start.elapsed() / n);
}

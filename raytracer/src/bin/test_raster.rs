use raytracer::{
    canvas::Canvas,
    matrices::Mat4,
    point_vec::{Point, V3D},
    TriangleRaster,
};

fn main() {
    let mut canvas = Canvas::new(800, 600);
    let raster = TriangleRaster::new();
    let transform = Mat4::translation(100.0, 100.0, 0.0);
    let triangle: [V3D; 3] = [
        transform.mul_tuple(&Point::new(50.0, 0.0, 0.0)).into(),
        transform.mul_tuple(&Point::new(0.0, 100.0, 0.0)).into(),
        transform.mul_tuple(&Point::new(100.0, 100.0, 0.0)).into(),
    ];
    raster.rasterize(&triangle, &mut canvas);
    canvas.loop_until_exit();
}

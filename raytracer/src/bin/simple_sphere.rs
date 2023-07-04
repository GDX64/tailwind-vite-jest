use raytracer::{
    canvas::Canvas,
    colors::Color,
    matrices::Mat4,
    point_vec::{Point, V3D},
    ray::Ray,
    Sphere::Sphere,
};

fn main() {
    let mut canvas = Canvas::new(400, 400);
    let sphere = Sphere::new(100.0, Point::new(0.0, 0.0, 100.0));
    //shooting rays
    (0..canvas.width as i32).for_each(|x| {
        (0..canvas.height as i32).for_each(|y| {
            let ray = Ray::new(V3D::new(0.0, 0.0, 1.0), Point::new(x as f64, y as f64, 0.0));
            if sphere.has_hits(&ray) {
                canvas.write(x, y, Color::new(1.0, 0.0, 0.0));
            }
        })
    });
    canvas.loop_until_exit();
}

use std::f64::consts::PI;

use raytracer::{canvas::Canvas, colors::Color, matrices::Mat4, point_vec::Point};

fn main() {
    let mut canvas = Canvas::new(800, 600);
    let translate = Mat4::translation(0.0, 0.0, 0.0);
    let transformation = translate * Mat4::rotation_z(PI / 2.0);
    let domain = -400..400;
    let image = domain
        .clone()
        .map(|x| (((x as f64) / 100.0).sin()) * 50.0 + 300.0);
    domain.zip(image).for_each(|(x, y)| {
        let point = Point::new(x as f64, y, 0.0);
        let point = transformation.mul_vec(&point);
        canvas.write(
            point.x as usize,
            point.y as usize,
            Color::new(1.0, 1.0, 0.0),
        );
    });
    canvas.loop_until_exit();
}

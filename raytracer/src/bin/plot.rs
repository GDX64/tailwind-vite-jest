use std::borrow::Borrow;

use raytracer::{canvas::Canvas, colors::Color};

fn main() {
    let mut canvas = Canvas::new(800, 600);
    let domain = 0..800;
    let image = domain
        .clone()
        .map(|x| (((x as f64) / 100.0).sin() + 1.0) * 300.0);
    domain.zip(image).for_each(|(x, y)| {
        canvas.write(x, y as usize, Color::new(1.0, 0.0, 0.0));
    });
    canvas.loop_until_exit();
}

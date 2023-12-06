use tracer::{canvas, colors::Color};
mod math;
mod tracer;

fn main() {
    let mut canvas = canvas::Canvas::new(800, 600);
    canvas.write(200, 200, Color::new(1.0, 0.0, 0.0));
    canvas.loop_until_exit();
}

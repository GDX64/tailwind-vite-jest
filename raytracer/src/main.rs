use minifb::Key;

mod PointVec;
mod canvas;

fn main() {
    let mut canvas = canvas::Canvas::new(800, 600);
    canvas.write(200, 200, 0xff0000);
    canvas.loop_until_exit();
}

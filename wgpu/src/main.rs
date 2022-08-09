use pong::run;

fn main() {
    pollster::block_on(run());
}

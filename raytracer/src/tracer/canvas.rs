use minifb::{Key, Window, WindowOptions};

pub struct Canvas {
    width: usize,
    height: usize,
    window: Window,
    pixels: Vec<u32>,
}

impl Canvas {
    pub fn new(width: usize, height: usize) -> Canvas {
        let window = Window::new(
            "Test - ESC to exit",
            width,
            height,
            WindowOptions::default(),
        )
        .unwrap();

        Canvas {
            width,
            height,
            window,
            pixels: vec![0; width * height],
        }
    }

    pub fn clear(&mut self) {
        for i in self.pixels.iter_mut() {
            *i = 0;
        }
    }

    pub fn write(&mut self, x: usize, y: usize, value: impl Into<u32>) {
        if let Some(item) = self.pixels.get_mut(y * self.width + x) {
            *item = value.into();
        }
    }

    pub fn update_canvas(&mut self) {
        self.window
            .update_with_buffer(&self.pixels, self.width, self.height)
            .unwrap();
    }

    pub fn loop_until_exit(&mut self) {
        while self.window.is_open() && !self.window.is_key_down(Key::Escape) {
            self.update_canvas();
        }
    }
}

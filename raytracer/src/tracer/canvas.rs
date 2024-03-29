use minifb::{Key, Window, WindowOptions};

pub struct Canvas {
    pub width: usize,
    pub height: usize,
    window: Window,
    pub pixels: Vec<u32>,
}

impl Canvas {
    pub fn new(width: usize, height: usize) -> Canvas {
        let mut window = Window::new(
            "Test - ESC to exit",
            width,
            height,
            WindowOptions::default(),
        )
        .unwrap();
        window.limit_update_rate(Some(std::time::Duration::from_micros(16600)));
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

    pub fn mutable_range(
        &mut self,
        x_start: usize,
        x_end: usize,
        y: usize,
    ) -> impl Iterator<Item = &mut u32> {
        let start = y * self.width + x_start;
        let end = y * self.width + x_end;
        self.pixels[start..end].iter_mut()
    }

    pub fn write(&mut self, x: i32, y: i32, value: impl Into<u32>) {
        if x >= self.width as i32 || y >= self.height as i32 || x < 0 || y < 0 {
            return;
        }
        if let Some(item) = self
            .pixels
            .get_mut((y as usize) * self.width + (x as usize))
        {
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

use super::point_vec::TupleLike;

pub struct Color {
    red: f64,
    blue: f64,
    green: f64,
    alpha: f64,
}

impl Color {
    pub fn new(red: f64, green: f64, blue: f64) -> Self {
        Color {
            red,
            green,
            blue,
            alpha: 1.0,
        }
    }

    pub fn to_u32(&self) -> u32 {
        let mut r = (self.red * 255.0) as u32;
        let mut g = (self.green * 255.0) as u32;
        let b = (self.blue * 255.0) as u32;
        let mut a = (self.alpha * 255.0) as u32;

        a = a << 24;
        r = r << 16;
        g = g << 8;

        r | g | b | a
    }
}

impl TupleLike for Color {
    fn get_x(&self) -> f64 {
        self.red
    }

    fn get_y(&self) -> f64 {
        self.blue
    }

    fn get_z(&self) -> f64 {
        self.green
    }

    fn get_w(&self) -> f64 {
        self.alpha
    }

    fn from_tuple(t: (f64, f64, f64, f64)) -> Self {
        Color {
            red: t.0,
            blue: t.1,
            green: t.2,
            alpha: t.3,
        }
    }
}

impl From<Color> for u32 {
    fn from(c: Color) -> Self {
        c.to_u32()
    }
}

#[cfg(test)]
mod test {
    use super::Color;

    #[test]
    fn to_color() {
        let c = Color::new(1.0, 0.0, 0.0);
        let u: u32 = c.into();
        assert_eq!(u, 0xFFFF0000);
    }
}

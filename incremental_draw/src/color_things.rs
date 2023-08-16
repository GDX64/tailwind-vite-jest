pub struct HSL {
    h: f32,
    s: f32,
    l: f32,
}

#[derive(Clone, Copy, Debug)]
pub struct RGB {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl HSL {
    pub fn new(h: f32, s: f32, l: f32) -> HSL {
        HSL { h, s, l }
    }

    pub fn to_rgb(&self) -> RGB {
        let c = (1.0 - (2.0 * self.l - 1.0).abs()) * self.s;
        let x = c * (1.0 - ((self.h / 60.0) % 2.0 - 1.0).abs());
        let m = self.l - c / 2.0;
        let (r, g, b) = if self.h < 60.0 {
            (c, x, 0.0)
        } else if self.h < 120.0 {
            (x, c, 0.0)
        } else if self.h < 180.0 {
            (0.0, c, x)
        } else if self.h < 240.0 {
            (0.0, x, c)
        } else if self.h < 300.0 {
            (x, 0.0, c)
        } else {
            (c, 0.0, x)
        };
        RGB {
            r: ((r + m) * 255.0) as u8,
            g: ((g + m) * 255.0) as u8,
            b: ((b + m) * 255.0) as u8,
        }
    }

    pub fn to_hex(&self) -> String {
        self.to_rgb().to_hex()
    }

    pub fn interpolate(&self, other: &HSL, t: f32) -> HSL {
        HSL {
            h: self.h + (other.h - self.h) * t,
            s: self.s + (other.s - self.s) * t,
            l: self.l + (other.l - self.l) * t,
        }
    }
}

impl RGB {
    pub fn to_hsl(&self) -> HSL {
        let r = self.r as f32 / 255.0;
        let g = self.g as f32 / 255.0;
        let b = self.b as f32 / 255.0;
        let c_max = r.max(g).max(b);
        let c_min = r.min(g).min(b);
        let delta = c_max - c_min;
        let h = if delta == 0.0 {
            0.0
        } else if c_max == r {
            60.0 * (((g - b) / delta) % 6.0)
        } else if c_max == g {
            60.0 * (((b - r) / delta) + 2.0)
        } else {
            60.0 * (((r - g) / delta) + 4.0)
        };
        let l = (c_max + c_min) / 2.0;
        let s = if delta == 0.0 {
            0.0
        } else {
            delta / (1.0 - (2.0 * l - 1.0).abs())
        };
        HSL { h, s, l }
    }

    pub fn to_hex(&self) -> String {
        format!("#{:02x}{:02x}{:02x}", self.r, self.g, self.b)
    }

    pub fn interpolate(&self, other: &RGB, t: f32) -> RGB {
        RGB {
            r: (self.r as f32 + (other.r as f32 - self.r as f32) * t) as u8,
            g: (self.g as f32 + (other.g as f32 - self.g as f32) * t) as u8,
            b: (self.b as f32 + (other.b as f32 - self.b as f32) * t) as u8,
        }
    }

    pub fn from_hex(hex: &str) -> Option<RGB> {
        if hex.len() != 7 {
            return None;
        }
        let hex = &hex[1..];
        let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
        let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
        let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
        Some(RGB { r, g, b })
    }
}

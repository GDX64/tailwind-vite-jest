pub fn euler_evolve(x: &mut V2, v: &mut V2, acc: &V2, dt: f32) {
    let dv = acc.mul_scalar(dt);
    let new_v = dv.add(v);
    *v = new_v;
    let dx = v.mul_scalar(dt);
    *x = dx.add(x);
}

pub struct V2 {
    pub x: f32,
    pub y: f32,
}

impl Clone for V2 {
    fn clone(&self) -> Self {
        Self {
            x: self.x,
            y: self.y,
        }
    }
}

impl V2 {
    pub fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }

    pub fn mul_scalar(&self, scalar: f32) -> Self {
        Self {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    pub fn add(&self, other: &Self) -> Self {
        Self {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }

    pub fn sub(&self, other: &Self) -> Self {
        Self {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }

    pub fn dot(&self, other: &Self) -> f32 {
        self.x * other.x + self.y * other.y
    }

    pub fn norm(&self) -> f32 {
        self.dot(self).sqrt()
    }

    pub fn normalize(&self) -> Self {
        self.mul_scalar(1.0 / self.norm())
    }

    pub fn norm_squared(&self) -> f32 {
        self.dot(self)
    }
}

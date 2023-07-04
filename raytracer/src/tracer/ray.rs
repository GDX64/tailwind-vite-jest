use crate::point_vec::{Point, TupleLike, V3D};

pub struct Ray {
    pub direction: V3D,
    pub origin: Point,
}

impl Ray {
    pub fn new(v: V3D, origin: Point) -> Ray {
        Ray {
            direction: v.normalize(),
            origin,
        }
    }

    pub fn calc_pos(&self, time: f64) -> Point {
        self.direction.scale(time) + self.origin
    }
}

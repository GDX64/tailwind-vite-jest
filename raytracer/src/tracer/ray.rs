use crate::{
    matrices::Mat4,
    point_vec::{Point, TupleLike, V3D},
    transformable::Transformable,
};

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

impl Transformable for Ray {
    fn transform(&self, m: &Mat4<f64>) -> Ray {
        Ray {
            direction: m.mul_tuple(&self.direction),
            origin: m.mul_tuple(&self.origin),
        }
    }
}

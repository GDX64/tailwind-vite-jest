use super::matrices::Mat4;

pub trait Transformable {
    fn transform(&self, m: &Mat4<f64>) -> Self;
}

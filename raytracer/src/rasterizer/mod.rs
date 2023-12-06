use crate::point_vec::{TupleLike, V3D};
use std::simd::{self, cmp::SimdPartialOrd};
type Triangle = [V3D; 3];
trait Boundable {
    fn min_max(&self) -> (V3D, V3D);
}

impl Boundable for &[V3D] {
    fn min_max(&self) -> (V3D, V3D) {
        let mut min = self[0];
        let mut max = self[0];
        for p in &self[..] {
            min.x = min.x.min(p.x);
            min.y = min.y.min(p.y);
            min.z = min.z.min(p.z);
            max.x = max.x.max(p.x);
            max.y = max.y.max(p.y);
            max.z = max.z.max(p.z);
        }
        (min, max)
    }
}

pub struct TriangleRaster {}

impl TriangleRaster {
    pub fn new() -> TriangleRaster {
        TriangleRaster {}
    }

    pub fn rasterize(&self, triangle: &Triangle, mut f: impl FnMut(i32, i32)) {
        let (min, max) = triangle.as_slice().min_max();
        for x in min.x as i32..=max.x as i32 {
            for y in min.y as i32..=max.y as i32 {
                let p = V3D::new(x as f64, y as f64, 0.0);
                if self.is_inside_triangle(&p, triangle) {
                    f(x, y);
                }
            }
        }
    }

    pub fn rasterize_simd(&self, triangle: &Triangle, mut f: impl FnMut(i32, i32)) {
        let (min, max) = triangle.as_slice().min_max();
        let simd_triangle = SimdTriangle::from_triangle(triangle);
        for y in min.y as i32..=max.y as i32 {
            //loop x 4 by 4
            for x in (min.x as i32..=max.x as i32).step_by(4) {
                let x_float = x as f32;
                let vx =
                    simd::f32x4::from_array([x_float, x_float + 1.0, x_float + 2.0, x_float + 3.0]);
                let vy = simd::f32x4::splat(y as f32);
                let mask = simd_triangle.is_inside(vx, vy);
                if mask.test(0) {
                    f(x, y);
                }
                if mask.test(1) {
                    f(x + 1, y);
                }
                if mask.test(2) {
                    f(x + 2, y);
                }
                if mask.test(3) {
                    f(x + 3, y);
                }
            }
        }
    }

    pub fn is_inside_triangle(&self, p: &V3D, triangle: &Triangle) -> bool {
        let (a, b, c) = (triangle[0], triangle[1], triangle[2]);
        let v0 = b - a;
        let v1 = c - b;
        let v2 = a - c;
        let cross0 = (*p - a).cross_z(&v0);
        let cross1 = (*p - b).cross_z(&v1);
        let cross2 = (*p - c).cross_z(&v2);
        cross0.is_sign_positive() && cross1.is_sign_positive() && cross2.is_sign_positive()
    }
}

struct SimdTriangle {
    x1: simd::f32x4,
    x2: simd::f32x4,
    x3: simd::f32x4,
    y1: simd::f32x4,
    y2: simd::f32x4,
    y3: simd::f32x4,
    vx1: simd::f32x4,
    vx2: simd::f32x4,
    vx3: simd::f32x4,
    vy1: simd::f32x4,
    vy2: simd::f32x4,
    vy3: simd::f32x4,
}

impl SimdTriangle {
    fn from_triangle(triangle: &Triangle) -> SimdTriangle {
        let (x1, x2, x3) = (
            simd::f32x4::splat(triangle[0].x as f32),
            simd::f32x4::splat(triangle[1].x as f32),
            simd::f32x4::splat(triangle[2].x as f32),
        );
        let (y1, y2, y3) = (
            simd::f32x4::splat(triangle[0].y as f32),
            simd::f32x4::splat(triangle[1].y as f32),
            simd::f32x4::splat(triangle[2].y as f32),
        );
        let (vx1, vx2, vx3) = (x2 - x1, x3 - x2, x1 - x3);
        let (vy1, vy2, vy3) = (y2 - y1, y3 - y2, y1 - y3);
        SimdTriangle {
            x1,
            x2,
            x3,
            y1,
            y2,
            y3,
            vx1,
            vx2,
            vx3,
            vy1,
            vy2,
            vy3,
        }
    }

    fn is_inside(&self, x: simd::f32x4, y: simd::f32x4) -> simd::Mask<i32, 4> {
        let zeros = simd::f32x4::splat(0.0);
        let cross0 = (x - self.x1) * self.vy1 - (y - self.y1) * self.vx1;
        let cross1 = (x - self.x2) * self.vy2 - (y - self.y2) * self.vx2;
        let cross2 = (x - self.x3) * self.vy3 - (y - self.y3) * self.vx3;
        let sign0 = cross0.simd_ge(zeros);
        let sign1 = cross1.simd_ge(zeros);
        let sign2 = cross2.simd_ge(zeros);
        let mask = sign0 & sign1 & sign2;
        mask
    }
}

#[cfg(test)]
mod test {
    use std::simd::{self, cmp::SimdPartialOrd};

    #[test]
    fn test_inside() {
        let raster = super::TriangleRaster::new();
        let triangle = [
            super::V3D::new(0.0, 0.0, 0.0),
            super::V3D::new(0.0, 100.0, 0.0),
            super::V3D::new(100.0, 100.0, 0.0),
        ];
        let inside = super::V3D::new(10.0, 50.0, 0.0);
        assert_eq!(raster.is_inside_triangle(&inside, &triangle), true);
        let outside = super::V3D::new(100.0, 0.0, 0.0);
        assert_eq!(raster.is_inside_triangle(&outside, &triangle), false);
    }

    #[test]
    fn simd_inside() {
        let triangle = [
            super::V3D::new(0.0, 0.0, 0.0),
            super::V3D::new(0.0, 100.0, 0.0),
            super::V3D::new(100.0, 100.0, 0.0),
        ];
        let simd_triangle = super::SimdTriangle::from_triangle(&triangle);
        let x = simd::f32x4::from_array([10.0, 10.0, 10.0, 10.0]);
        let y = simd::f32x4::from_array([50.0, 50.0, 50.0, 50.0]);
        let mask = simd_triangle.is_inside(x, y);
        assert_eq!(mask.test(0), true);
        assert_eq!(mask.test(1), true);
        assert_eq!(mask.test(2), true);
        assert_eq!(mask.test(3), true);
        let x = simd::f32x4::from_array([100.0, 100.0, 100.0, 100.0]);
        let y = simd::f32x4::from_array([0.0, 0.0, 0.0, 0.0]);
        let mask = simd_triangle.is_inside(x, y);
        assert_eq!(mask.test(0), false);
        assert_eq!(mask.test(1), false);
        assert_eq!(mask.test(2), false);
        assert_eq!(mask.test(3), false);
    }
}

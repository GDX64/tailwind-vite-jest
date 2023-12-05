use crate::{
    canvas::Canvas,
    point_vec::{TupleLike, V3D},
};
use std::simd::{self, cmp::SimdPartialOrd, simd_swizzle};
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

pub struct TriangleRaster {
    color: crate::colors::Color,
}

impl TriangleRaster {
    pub fn new() -> TriangleRaster {
        TriangleRaster {
            color: crate::colors::Color::new(1.0, 1.0, 0.0),
        }
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
            for x in min.x as i32..=max.x as i32 {
                if simd_triangle.is_inside(x as f32, y as f32) {
                    f(x, y);
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
    x: simd::f32x4,
    y: simd::f32x4,
    vx: simd::f32x4,
    vy: simd::f32x4,
    mask: simd::f32x4,
}

impl SimdTriangle {
    fn from_triangle(triangle: &Triangle) -> SimdTriangle {
        let x = simd::f32x4::from_array([
            triangle[0].x as f32,
            triangle[1].x as f32,
            triangle[2].x as f32,
            0.0,
        ]);
        let y = simd::f32x4::from_array([
            triangle[0].y as f32,
            triangle[1].y as f32,
            triangle[2].y as f32,
            0.0,
        ]);
        let x_shifted = simd_swizzle!(x, [1, 2, 0, 3]);
        let y_shifted = simd_swizzle!(y, [1, 2, 0, 3]);
        let vx = x_shifted - x;
        let vy = y_shifted - y;
        SimdTriangle {
            x,
            y,
            vx,
            vy,
            mask: simd::f32x4::splat(0.0),
        }
    }

    fn is_inside(&self, x: f32, y: f32) -> bool {
        let px = simd::f32x4::splat(x);
        let py = simd::f32x4::splat(y);
        let pv1 = self.x - px;
        let pv2 = self.y - py;
        let cross_z = self.vx * pv2 - self.vy * pv1;
        let mask = cross_z.simd_ge(self.mask);
        mask.all()
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
            super::V3D::new(150.0, 100.0, 0.0),
            super::V3D::new(100.0, 200.0, 0.0),
            super::V3D::new(200.0, 200.0, 0.0),
        ];
        let simd_triangle = super::SimdTriangle::from_triangle(&triangle);
        assert_eq!(simd_triangle.is_inside(150.0, 150.0), true);
        // assert_eq!(simd_triangle.is_inside(60.0, 50.0), false);
    }
}

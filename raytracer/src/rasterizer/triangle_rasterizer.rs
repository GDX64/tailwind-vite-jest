use crate::math::point_vec::{TupleLike, V3D};
use std::{
    borrow::BorrowMut,
    simd::{self, cmp::SimdPartialOrd},
};
type Triangle = [V3D; 3];

const PAINT_COLOR: u32 = 0xff0022aa;

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

    pub fn rasterize(&self, triangle: &Triangle, canvas: &mut [u32], width: usize) {
        //find triangle boundaries so we don't have to check all the canvas
        let (min, max) = triangle.as_slice().min_max();
        let normal_triangle = NormalTriangle::from_triangle(triangle);
        for y in min.y as usize..=max.y as usize {
            let index_start = y * width + min.x as usize;
            let index_end = y * width + max.x as usize;
            if index_end >= canvas.len() {
                break;
            }
            let mut x = min.x;
            canvas[index_start..index_end].iter_mut().for_each(|color| {
                let p = V3D::new(x as f64, y as f64, 0.0);
                if normal_triangle.is_inside(&p) {
                    *color = PAINT_COLOR;
                }
                x += 1.0;
            });
        }
    }

    pub fn rasterize_simd(&self, triangle: &Triangle, canvas: &mut [u32], width: usize) {
        let (min, max) = triangle.as_slice().min_max();
        let simd_triangle = SimdTriangle::from_triangle(triangle);
        let vx0 = simd::f32x4::from_array([0.0, 1.0, 2.0, 3.0]);
        let vx0 = vx0 + simd::f32x4::splat(min.x as f32);
        let add_four = simd::f32x4::splat(4.0);
        let paint_values = simd::u32x4::splat(PAINT_COLOR);
        let not_paint_values = simd::u32x4::splat(0xaaaaaaaa);

        for y in min.y as usize..=max.y as usize {
            let mut vx = vx0;
            let vy = simd::f32x4::splat(y as f32);
            let index_start = y * width + min.x as usize;
            let index_end = y * width + max.x as usize;
            if index_end >= canvas.len() {
                break;
            }

            //we use chunks exact because the compiler makes it much more efficient skiping the bounds check
            let mut chunks = canvas[index_start..index_end].chunks_exact_mut(4);
            chunks.borrow_mut().for_each(|chunk| {
                let mask = simd_triangle.is_inside(vx, vy);
                vx = vx + add_four;
                let painted = mask.select(paint_values, not_paint_values);
                painted.copy_to_slice(chunk);
            });

            //then we paint the remainder
            let remainder = chunks.into_remainder();
            if remainder.len() > 0 {
                let mask = simd_triangle.is_inside(vx, vy);
                let painted = mask.select(paint_values, not_paint_values).to_array();
                remainder
                    .iter_mut()
                    .zip(painted.into_iter())
                    .for_each(|(c, p)| {
                        *c = p;
                    });
            }
        }
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
}

#[cfg(test)]
mod test {
    use std::simd::{self};

    #[test]
    fn test_inside() {
        let triangle = [
            super::V3D::new(0.0, 0.0, 0.0),
            super::V3D::new(0.0, 100.0, 0.0),
            super::V3D::new(100.0, 100.0, 0.0),
        ];
        let normal_triangle = super::NormalTriangle::from_triangle(&triangle);
        let inside = super::V3D::new(10.0, 50.0, 0.0);
        assert_eq!(normal_triangle.is_inside(&inside), true);
        let outside = super::V3D::new(100.0, 0.0, 0.0);
        assert_eq!(normal_triangle.is_inside(&outside), false);
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

struct NormalTriangle {
    abc: [V3D; 3],
    v012: [V3D; 3],
}

impl NormalTriangle {
    fn is_inside(&self, p: &V3D) -> bool {
        let cross0 = (*p - self.abc[0]).cross_z(&self.v012[0]);
        let cross1 = (*p - self.abc[1]).cross_z(&self.v012[1]);
        let cross2 = (*p - self.abc[2]).cross_z(&self.v012[2]);
        cross0.is_sign_positive() && cross1.is_sign_positive() && cross2.is_sign_positive()
    }

    fn from_triangle(triangle: &Triangle) -> NormalTriangle {
        let (a, b, c) = (triangle[0], triangle[1], triangle[2]);
        let v0 = b - a;
        let v1 = c - b;
        let v2 = a - c;
        NormalTriangle {
            abc: [a, b, c],
            v012: [v0, v1, v2],
        }
    }
}

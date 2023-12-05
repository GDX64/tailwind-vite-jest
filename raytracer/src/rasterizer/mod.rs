use crate::{
    canvas::Canvas,
    point_vec::{TupleLike, V3D},
};

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

    pub fn rasterize(&self, triangle: &Triangle, canvas: &mut Canvas) {
        let (min, max) = triangle.as_slice().min_max();
        for x in min.x as i32..=max.x as i32 {
            for y in min.y as i32..=max.y as i32 {
                let p = V3D::new(x as f64, y as f64, 0.0);
                if self.is_inside(&p, triangle) {
                    canvas.write(x, y, self.color.to_u32());
                }
            }
        }
    }

    pub fn is_inside(&self, p: &V3D, triangle: &Triangle) -> bool {
        let (a, b, c) = (triangle[0], triangle[1], triangle[2]);
        let v0 = b - a;
        let v1 = c - b;
        let v2 = a - c;
        let cross0 = (*p - a).cross(&v0);
        let cross1 = (*p - b).cross(&v1);
        let cross2 = (*p - c).cross(&v2);
        cross0.z.is_sign_positive() && cross1.z.is_sign_positive() && cross2.z.is_sign_positive()
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_inside() {
        let raster = super::TriangleRaster::new();
        let triangle = [
            super::V3D::new(0.0, 0.0, 0.0),
            super::V3D::new(0.0, 100.0, 0.0),
            super::V3D::new(100.0, 100.0, 0.0),
        ];
        let inside = super::V3D::new(10.0, 50.0, 0.0);
        assert_eq!(raster.is_inside(&inside, &triangle), true);
        let outside = super::V3D::new(100.0, 0.0, 0.0);
        assert_eq!(raster.is_inside(&outside, &triangle), false);
    }
}

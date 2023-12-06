use crate::math::{
    matrices::Mat4,
    point_vec::{Point, TupleLike},
    transformable::Transformable,
};

use super::ray::Ray;

pub struct Sphere {
    m: Mat4<f64>,
}

pub struct Intersection<'a> {
    t: f64,
    object: &'a Sphere,
}

impl Sphere {
    pub fn new(radius: f64, origin: Point) -> Sphere {
        let m = Mat4::scaling(radius, radius, radius);
        let m = m * Mat4::translation(origin.x, origin.y, origin.z);
        Sphere { m }
    }

    fn intersect(&self, ray: &Ray) -> Vec<Intersection> {
        let mut result = Vec::new();
        if let Some(inverse) = self.m.inverse() {
            let ray = ray.transform(&inverse);
            let sphere_to_ray = ray.origin - Point::new(0.0, 0.0, 0.0);
            let a = ray.direction.dot(&ray.direction);
            let b = 2.0 * ray.direction.dot(&sphere_to_ray);
            let c = sphere_to_ray.dot(&sphere_to_ray) - 1.0;
            let discriminant = b * b - 4.0 * a * c;
            if discriminant < 0.0 {
                return result;
            }
            let t1 = (-b - discriminant.sqrt()) / (2.0 * a);
            let t2 = (-b + discriminant.sqrt()) / (2.0 * a);
            result.push(Intersection {
                t: t1,
                object: self,
            });
            result.push(Intersection {
                t: t2,
                object: self,
            });
            result
        } else {
            result
        }
    }

    pub fn hits(&self, ray: &Ray) -> Vec<Intersection> {
        let mut intersects = self.intersect(ray);
        intersects.retain(|i| i.t > 0.0);
        intersects
    }

    pub fn has_hits(&self, ray: &Ray) -> bool {
        let intersects = self.intersect(ray);
        intersects.iter().any(|i| i.t > 0.0)
    }
}

impl Transformable for Sphere {
    fn transform(&self, m: &Mat4<f64>) -> Sphere {
        Sphere {
            m: m.mul_ref(&self.m),
        }
    }
}

#[cfg(test)]
mod test {
    use crate::{
        math::point_vec::{Point, V3D},
        tracer::ray::Ray,
    };

    use super::Sphere;

    #[test]
    fn intersect_origin() {
        let sphere = Sphere::new(1.0, Point::new(0.0, 0.0, 0.0));
        let ray = Ray::new(V3D::new(0.0, 0.0, -5.0), Point::new(0.0, 0.0, 1.0));
        let intersections = sphere.intersect(&ray);
        assert_eq!(intersections.len(), 2);
    }

    #[test]
    fn no_intersection() {
        let sphere = Sphere::new(1.0, Point::new(0.0, 0.0, 0.0));
        let ray = Ray::new(V3D::new(10.0, 0.0, 0.0), Point::new(0.0, 0.0, 10.0));
        let intersections = sphere.intersect(&ray);
        assert_eq!(intersections.len(), 0);
    }

    #[test]
    fn should_hit() {
        let sphere = Sphere::new(100.0, Point::new(0.0, 0.0, 100.0));
        let ray = Ray::new(V3D::new(0.0, 0.0, 1.0), Point::new(50.0, 50.0, 0.0));
        assert!(sphere.has_hits(&ray));
    }
}

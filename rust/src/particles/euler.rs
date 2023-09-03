pub fn euler_evolve(x: &mut V4, v: &mut V4, acc: &V4, dt: f32) {
    let dv = acc.mul_scalar(dt);
    let new_v = dv.add(v);
    *v = new_v;
    let dx = v.mul_scalar(dt);
    *x = dx.add(x);
}

#[derive(Clone, PartialEq, Debug)]
pub struct V4 {
    arr: [f32; 4],
}

impl V4 {
    pub fn x(&self) -> f32 {
        self.arr[0]
    }

    pub fn y(&self) -> f32 {
        self.arr[1]
    }

    pub fn z(&self) -> f32 {
        self.arr[2]
    }

    pub fn w(&self) -> f32 {
        self.arr[3]
    }

    pub fn xyz(x: f32, y: f32, z: f32) -> Self {
        Self {
            arr: [x, y, z, 1.0],
        }
    }

    pub fn is_close_to(&self, other: &V4) -> bool {
        self.sub(other).norm_squared() < 0.001
    }

    pub fn new(x: f32, y: f32, z: f32, w: f32) -> Self {
        Self { arr: [x, y, z, w] }
    }

    pub fn mul_scalar(&self, scalar: f32) -> Self {
        Self {
            arr: [
                self.x() * scalar,
                self.y() * scalar,
                self.z() * scalar,
                self.w() * scalar,
            ],
        }
    }

    pub fn add(&self, other: &Self) -> Self {
        Self {
            arr: [
                self.x() + other.x(),
                self.y() + other.y(),
                self.z() + other.z(),
                self.w() + other.w(),
            ],
        }
    }

    pub fn sub(&self, other: &Self) -> Self {
        Self {
            arr: [
                self.x() - other.x(),
                self.y() - other.y(),
                self.z() - other.z(),
                self.w() - other.w(),
            ],
        }
    }

    pub fn dot(&self, other: &Self) -> f32 {
        self.x() * other.x() + self.y() * other.y() + self.z() * other.z() + self.w() * other.w()
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

    pub fn add_mut(&mut self, other: &Self) {
        self.arr[0] += other.x();
        self.arr[1] += other.y();
        self.arr[2] += other.z();
        self.arr[3] += other.w();
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct Mat4 {
    rows: [V4; 4],
}

impl Mat4 {
    pub fn identity() -> Self {
        Self {
            rows: [
                V4::new(1.0, 0.0, 0.0, 0.0),
                V4::new(0.0, 1.0, 0.0, 0.0),
                V4::new(0.0, 0.0, 1.0, 0.0),
                V4::new(0.0, 0.0, 0.0, 1.0),
            ],
        }
    }

    pub fn v_mul(&self, v: &V4) -> V4 {
        V4::new(
            self.rows[0].dot(v),
            self.rows[1].dot(v),
            self.rows[2].dot(v),
            self.rows[3].dot(v),
        )
    }

    pub fn rotate_y(angle: f32) -> Self {
        let mut mat = Self::identity();
        let cos = angle.cos();
        let sin = angle.sin();
        mat.rows[0] = V4::new(cos, 0.0, sin, 0.0);
        mat.rows[2] = V4::new(-sin, 0.0, cos, 0.0);
        mat
    }

    pub fn rotate_x(angle: f32) -> Self {
        let mut mat = Self::identity();
        let cos = angle.cos();
        let sin = angle.sin();
        mat.rows[1] = V4::new(0.0, cos, -sin, 0.0);
        mat.rows[2] = V4::new(0.0, sin, cos, 0.0);
        mat
    }

    pub fn translation_mat(x: f32, y: f32, z: f32) -> Self {
        let mut mat = Self::identity();
        mat.rows[3] = V4::new(x, y, z, 1.0);
        mat.transpose()
    }

    pub fn transpose(&self) -> Self {
        let mut mat = Self::identity();
        mat.rows[0] = V4::new(
            self.rows[0].x(),
            self.rows[1].x(),
            self.rows[2].x(),
            self.rows[3].x(),
        );
        mat.rows[1] = V4::new(
            self.rows[0].y(),
            self.rows[1].y(),
            self.rows[2].y(),
            self.rows[3].y(),
        );
        mat.rows[2] = V4::new(
            self.rows[0].z(),
            self.rows[1].z(),
            self.rows[2].z(),
            self.rows[3].z(),
        );
        mat.rows[3] = V4::new(
            self.rows[0].w(),
            self.rows[1].w(),
            self.rows[2].w(),
            self.rows[3].w(),
        );
        mat
    }

    pub fn mul(&self, other: &Self) -> Self {
        let mut mat = Self::identity();
        let other = other.transpose();
        mat.rows[0] = self.v_mul(&other.rows[0]);
        mat.rows[1] = self.v_mul(&other.rows[1]);
        mat.rows[2] = self.v_mul(&other.rows[2]);
        mat.rows[3] = self.v_mul(&other.rows[3]);
        mat.transpose()
    }

    pub fn orthogonal_projection(plane: &V4) -> Self {
        let mut mat = Self::identity();
        let plane = plane.normalize();
        let x = plane.x();
        let y = plane.y();
        let z = plane.z();
        mat.rows[0] = V4::new(1.0 - x * x, -x * y, -x * z, 0.0);
        mat.rows[1] = V4::new(-y * x, 1.0 - y * y, -y * z, 0.0);
        mat.rows[2] = V4::new(-z * x, -z * y, 1.0 - z * z, 0.0);
        mat
    }
}

#[cfg(test)]
mod test {
    use std::f32::consts::PI;

    use super::Mat4;
    use super::V4;

    #[test]
    fn translate() {
        let m = Mat4::translation_mat(10.0, 10.0, 0.0);
        let v = m.v_mul(&V4::xyz(0.0, 0.0, 0.0));
        assert_eq!(v, V4::xyz(10.0, 10.0, 0.0));
    }

    #[test]
    fn rotate() {
        let m = Mat4::rotate_x(PI);
        let v = m.v_mul(&V4::xyz(0.0, 1.0, 0.0));
        assert!(v.is_close_to(&V4::xyz(0.0, -1.0, 0.0)));
    }

    #[test]
    fn translate_rotate() {
        let v = V4::xyz(0.0, 0.0, 1.0);
        let t = Mat4::translation_mat(10.0, 0.0, 0.0);
        let r = Mat4::rotate_y(PI / 2.0);
        let m = t.mul(&r);
        let res = m.v_mul(&v);
        assert!(res.is_close_to(&V4::xyz(11.0, 0.0, 0.0)));
    }

    #[test]
    fn projection() {
        let p = V4::xyz(1.0, -1.0, 0.0);
        let m = Mat4::orthogonal_projection(&p);
        let v = V4::xyz(1.0, 1.0, 0.0);
        let res = m.v_mul(&v);
        assert!(res.is_close_to(&V4::xyz(1.0, 1.0, 0.0)));
    }
}

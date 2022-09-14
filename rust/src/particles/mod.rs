mod euler;

use nalgebra::MatrixXx2;

use self::euler::Euler;

use super::random;

type Mat = MatrixXx2<f64>;

pub struct ParticleWorld {
    euler: Euler<Mat, Box<dyn (Fn(&Mat, &Mat, f64) -> Mat)>>,
}

impl ParticleWorld {
    pub fn random_world(max_x: f64, max_y: f64, number_of_particles: usize) -> Self {
        let v = (0..number_of_particles).flat_map(|_| {
            return [random() * max_x, random() * max_y];
        });
        let dv: Box<dyn (Fn(&Mat, &Mat, f64) -> Mat)> =
            Box::new(|x: &Mat, _: &Mat, _: f64| x.clone() * -1.0);
        let matrix = MatrixXx2::from_iterator(number_of_particles, v);
        let euler = Euler {
            x: matrix,
            v: MatrixXx2::zeros(number_of_particles),
            t: 0.0,
            dt: 0.1,
            dv,
        };
        ParticleWorld { euler }
    }

    pub fn evolve(&mut self) {
        self.euler.evolve();
    }
}

#[cfg(test)]
mod test {
    use super::ParticleWorld;
    #[test]
    fn test() {
        let world = ParticleWorld::random_world(10.0, 10.0, 2);
        let x = &world.euler.x;
    }
}

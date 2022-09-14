mod euler;

use nalgebra::MatrixXx2;

use self::euler::{Euler, Evolvable};

use super::random;

struct ParticleWorld {
    euler: Box<dyn Evolvable<MatrixXx2<f64>>>,
}

impl ParticleWorld {
    fn random_world(max_x: f64, max_y: f64, number_of_particles: usize) -> Self {
        let v = (0..number_of_particles).flat_map(|_| {
            return [random() * max_x, random() * max_y];
        });
        let matrix = MatrixXx2::from_iterator(number_of_particles, v);
        let euler = Euler {
            x: matrix,
            v: MatrixXx2::zeros(number_of_particles),
            t: 0.0,
            dt: 0.1,
            dv: |x: &MatrixXx2<f64>, _: &MatrixXx2<f64>, _: f64| x.clone() * -1.0,
        };
        ParticleWorld {
            euler: Box::new(euler),
        }
    }
}

#[cfg(test)]
mod test {
    use super::ParticleWorld;
    #[test]
    fn test() {
        let world = ParticleWorld::random_world(10.0, 10.0, 2);
        let x = world.euler.get_x();
    }
}

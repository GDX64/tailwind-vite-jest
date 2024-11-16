pub trait CanTransition {
    fn interpolate(&self, other: &Self, t: f64) -> Self;
}

#[derive(Clone)]
pub struct Transition<T: CanTransition> {
    start: T,
    end: T,
    start_time: f64,
    duration: f64,
    time_now: f64,
}

impl<T: CanTransition> Transition<T> {
    pub fn new(start: T, end: T, duration: f64) -> Self {
        Self {
            start,
            end,
            duration,
            start_time: 0.0,
            time_now: 0.0,
        }
    }

    pub fn get_target(&self) -> &T {
        &self.end
    }

    pub fn progress(&self) -> f64 {
        ((self.time_now - self.start_time) / self.duration).min(1.0)
    }

    pub fn update_time(&mut self, time: f64) {
        self.time_now = time;
    }

    pub fn now(&self) -> T {
        self.start.interpolate(&self.end, self.progress())
    }

    pub fn update_target(&mut self, target: T, time: f64) {
        self.time_now = time;
        self.start = self.now();
        self.end = target;
        self.start_time = time;
    }
}

use std::{
    cell::RefCell,
    rc::{Rc, Weak},
};

fn main() {}

struct InnerSignal<T> {
    value: T,
    deps: Vec<Weak<dyn Waker>>,
}

trait Waker {
    fn wake(&self);
}

struct InnerComputed<T, A1, F: Fn(&A1) -> T> {
    value: Option<T>,
    f: F,
    awake: bool,
    signal: Signal<A1>,
    deps: Vec<Weak<dyn Waker>>,
}

struct Computed<T, A1, F: Fn(&A1) -> T> {
    inner: Rc<RefCell<InnerComputed<T, A1, F>>>,
}

impl<T, A1, F: Fn(&A1) -> T> Waker for Computed<T, A1, F> {
    fn wake(&self) {
        self.inner.borrow_mut().awake = true;
    }
}

impl<T, A1, F: Fn(&A1) -> T> Computed<T, A1, F> {
    fn with<K>(&self, f: impl Fn(&T) -> K) -> K {
        let mut inner = self.inner.borrow_mut();
        if inner.awake && inner.value.is_none() {
            let v = inner.signal.with(|v| (inner.f)(v));
            inner.value = Some(v);
            inner.awake = false;
        }
        let v = inner.value.as_ref().unwrap();
        f(v)
    }
}

struct Signal<T> {
    inner: Rc<RefCell<InnerSignal<T>>>,
}

impl<T> Clone for Signal<T> {
    fn clone(&self) -> Self {
        Signal {
            inner: self.inner.clone(),
        }
    }
}

impl<T> Signal<T> {
    fn new(value: T) -> Signal<T> {
        Signal {
            inner: Rc::new(RefCell::new(InnerSignal {
                value,
                deps: vec![],
            })),
        }
    }

    fn with<K>(&self, f: impl Fn(&T) -> K) -> K {
        let v = &self.inner.borrow().value;
        f(v)
    }

    fn set(&self, value: T) {
        let mut inner = self.inner.borrow_mut();
        inner.value = value;
        inner.deps.iter().for_each(|waker| {
            if let Some(waker) = waker.upgrade() {
                waker.wake()
            }
        });
    }

    fn map<K, F: Fn(&T) -> K>(&self, f: F) -> Computed<K, T, F> {
        Computed {
            inner: Rc::new(RefCell::new(InnerComputed {
                value: None,
                f,
                awake: true,
                signal: self.clone(),
                deps: vec![],
            })),
        }
    }
}

#[cfg(test)]
mod test {
    use crate::Signal;

    #[test]
    fn testzin() {
        let s = Signal::new(0);
        let comp = s.map(|v| *v + 1);
        assert_eq!(comp.with(|v| *v), 1);
    }
}

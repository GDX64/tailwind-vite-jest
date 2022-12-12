use std::{
    cell::RefCell,
    rc::{Rc, Weak},
};

fn main() {}

struct InnerSignal<T> {
    value: T,
    deps: Vec<Weak<dyn Fn()>>,
}

struct InnerComputed<T: 'static, F: Fn(Weak<dyn Fn()>) -> T + 'static> {
    value: Option<T>,
    f: F,
    awake: bool,
    deps: Vec<Weak<dyn Fn()>>,
}

struct Computed<T: 'static, F: Fn(Weak<dyn Fn()>) -> T + 'static> {
    inner: Rc<RefCell<InnerComputed<T, F>>>,
}

impl<T: 'static, F: Fn(Weak<dyn Fn()>) -> T + 'static> Computed<T, F> {
    fn with<K>(&self, f: impl Fn(&T) -> K) -> K {
        let mut inner = self.inner.borrow_mut();
        if inner.awake && inner.value.is_none() {
            let c = self.clone();
            let waker: Rc<dyn Fn()> = Rc::new(move || c.inner.borrow_mut().awake = true);
            let v = (inner.f)(Rc::downgrade(&waker));
            inner.value = Some(v);
            inner.awake = false;
        }
        let v = inner.value.as_ref().unwrap();
        f(v)
    }

    fn new(f: F) -> Computed<T, F> {
        Computed {
            inner: Rc::new(RefCell::new(InnerComputed {
                value: None,
                f,
                awake: true,
                deps: vec![],
            })),
        }
    }
}

impl<T: 'static, F: Fn(Weak<dyn Fn()>) -> T + 'static> Clone for Computed<T, F> {
    fn clone(&self) -> Self {
        Computed {
            inner: self.inner.clone(),
        }
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

    fn with_track<K>(&self, waker: Weak<dyn Fn()>, f: impl Fn(&T) -> K) -> K {
        {
            self.inner.borrow_mut().deps.push(waker);
        }
        self.with(f)
    }

    fn set(&self, value: T) {
        let mut inner = self.inner.borrow_mut();
        inner.value = value;
        inner.deps.iter().for_each(|waker| {
            if let Some(waker) = waker.upgrade() {
                waker()
            }
        });
    }
}

#[cfg(test)]
mod test {
    use crate::{Computed, Signal};

    #[test]
    fn testzin() {
        let s = Signal::new(0);
        let comp = Computed::new(move |waker| s.with_track(waker, |val| *val + 1));
        assert_eq!(comp.with(|v| *v), 1);
    }
}

use std::{
    cell::{Ref, RefCell},
    rc::{Rc, Weak},
};

fn main() {}

type Waker = Weak<dyn Fn()>;

trait SignalLike<T>: Clone {
    // fn with<K>(&self, f: impl Fn(&T) -> K) -> K;
    fn with_track<K>(&self, waker: &Waker, f: impl Fn(&T) -> K) -> K;

    // fn and<K, U>(&self, other: impl SignalLike<K>, f: impl Fn(&T, &K) -> U) -> U;
    fn get_ref(&self) -> Ref<T>;

    fn get(&self, waker: &Waker) -> Ref<T> {
        self.track(waker);
        self.get_ref()
    }

    fn track(&self, waker: &Waker);
}

struct InnerSignal<T> {
    value: T,
    deps: Vec<Waker>,
}

struct InnerComputed<T: 'static, F: Fn(&Waker) -> T + 'static> {
    value: Option<T>,
    f: F,
    awake: bool,
    deps: Vec<Waker>,
}

struct Computed<T: 'static, F: Fn(&Waker) -> T + 'static> {
    inner: Rc<RefCell<InnerComputed<T, F>>>,
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> Computed<T, F> {
    fn with<K>(&self, f: impl Fn(&T) -> K) -> K {
        self.update_value_if_needed();
        let inner = self.inner.borrow_mut();
        let v = inner.value.as_ref().unwrap();
        f(v)
    }

    fn update_value_if_needed(&self) {
        let mut inner = self.inner.borrow_mut();
        if inner.awake && inner.value.is_none() {
            let c = self.clone();
            let waker: Rc<dyn Fn()> = Rc::new(move || c.inner.borrow_mut().awake = true);
            let v = (inner.f)(&Rc::downgrade(&waker));
            inner.value = Some(v);
            inner.awake = false;
        }
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

impl<T: 'static, F: Fn(&Waker) -> T + 'static> SignalLike<T> for Computed<T, F> {
    fn with_track<K>(&self, waker: &Waker, f: impl Fn(&T) -> K) -> K {
        self.track(waker);
        self.with(f)
    }

    fn get_ref(&self) -> Ref<T> {
        self.update_value_if_needed();
        let r = RefCell::borrow(&self.inner);
        let v = Ref::map(r, |v| v.value.as_ref().unwrap());
        v
    }

    fn track(&self, waker: &Waker) {
        self.inner.borrow_mut().deps.push(waker.clone());
    }
}

impl<T: 'static> SignalLike<T> for Signal<T> {
    fn with_track<K>(&self, waker: &Waker, f: impl Fn(&T) -> K) -> K {
        self.track(waker);
        self.with(f)
    }

    fn get_ref(&self) -> Ref<T> {
        let r = RefCell::borrow(&self.inner);
        let v = Ref::map(r, |v| &v.value);
        v
    }

    fn track(&self, waker: &Waker) {
        self.inner.borrow_mut().deps.push(waker.clone());
    }
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> Clone for Computed<T, F> {
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

impl<T: 'static> Signal<T> {
    fn new(value: T) -> Signal<T> {
        Signal {
            inner: Rc::new(RefCell::new(InnerSignal {
                value,
                deps: vec![],
            })),
        }
    }

    fn with<K>(&self, f: impl Fn(&T) -> K) -> K {
        let v = &RefCell::borrow(&self.inner).value;
        f(v)
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

fn and_2<T: 'static, K: 'static, U: 'static>(
    one: &(impl SignalLike<T> + 'static),
    other: &(impl SignalLike<K> + 'static),
    f: impl Fn(&T, &K) -> U + 'static,
) -> impl SignalLike<U> + 'static {
    let s1 = one.clone();
    let s2 = other.clone();
    Computed::new(move |waker| {
        let s1 = s1.get(waker);
        let s2 = s2.get(waker);
        f(&s1, &s2)
    })
}

#[cfg(test)]
mod test {
    use crate::{and_2, Signal, SignalLike};

    #[test]
    fn testzin() {
        let s1 = Signal::new(3);
        let s2 = Signal::new(2);
        let c = and_2(&s1, &s2, |v1, v2| *v1 + *v2);
        assert_eq!(*c.get_ref(), 5);

        let c2 = and_2(&s1, &s2, |v1, v2| *v1 + *v2 + 1);
        assert_eq!(*c2.get_ref(), 6);
    }
}

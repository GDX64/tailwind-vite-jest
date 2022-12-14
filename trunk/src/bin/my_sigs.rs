use std::{
    cell::{Ref, RefCell, RefMut},
    rc::{Rc, Weak},
};

fn main() {}

type Waker = Weak<dyn InnerWaker>;

trait InnerWaker {
    fn wakeup(&self);
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> InnerWaker for RefCell<InnerComputed<T, F>> {
    fn wakeup(&self) {
        self.borrow_mut().awake = true
    }
}

trait SignalLike<T>: Clone {
    fn with_track<K>(&self, waker: &Waker, f: impl Fn(&T) -> K) -> K;

    fn get_ref(&self) -> Ref<T>;

    fn get(&self, waker: &Waker) -> Ref<T> {
        self.track(waker);
        self.get_ref()
    }

    fn get_deps<'a>(&'a self) -> RefMut<'a, Vec<Waker>>;

    fn track(&self, waker: &Waker) {
        let mut deps = self.get_deps();
        if !deps.iter().any(|item| Weak::ptr_eq(waker, item)) {
            deps.push(waker.clone());
        }
    }

    fn notify(&self) {
        let mut deps = self.get_deps();
        *deps = deps
            .iter()
            .filter_map(|waker| {
                let waker_option = waker.upgrade();
                if let Some(waker_fn) = waker_option.as_ref() {
                    waker_fn.wakeup();
                    Some(waker.clone())
                } else {
                    None
                }
            })
            .collect();
    }
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
        if inner.awake {
            let waker: Waker = Rc::downgrade(&(self.inner.clone() as Rc<dyn InnerWaker>));
            let v = (inner.f)(&waker);
            inner.value = Some(v);
            inner.awake = false;
        }
    }

    fn wakeup(&self) {
        let mut inner = self.inner.borrow_mut();
        inner.awake = true;
        self.notify();
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

    fn get_deps<'a>(&'a self) -> RefMut<'a, Vec<Waker>> {
        RefMut::map(self.inner.borrow_mut(), |r| &mut r.deps)
    }

    fn get_ref(&self) -> Ref<T> {
        self.update_value_if_needed();
        let r = RefCell::borrow(&self.inner);
        let v = Ref::map(r, |v| v.value.as_ref().unwrap());
        v
    }
}

impl<T: 'static> SignalLike<T> for Signal<T> {
    fn with_track<K>(&self, waker: &Waker, f: impl Fn(&T) -> K) -> K {
        self.track(waker);
        self.with(f)
    }

    fn get_deps<'a>(&'a self) -> RefMut<'a, Vec<Waker>> {
        RefMut::map(self.inner.borrow_mut(), |r| &mut r.deps)
    }

    fn get_ref(&self) -> Ref<T> {
        let r = RefCell::borrow(&self.inner);
        let v = Ref::map(r, |v| &v.value);
        v
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
        {
            let mut inner = self.inner.borrow_mut();
            inner.value = value;
        }
        self.notify();
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
        let s1 = Signal::new(1);
        let s2 = Signal::new(1);
        let c = and_2(&s1, &s2, |v1, v2| *v1 + *v2);
        let c2 = and_2(&s1, &s2, |v1, v2| *v1 + *v2 + 1);
        {
            assert_eq!(*c.get_ref(), 2);
            assert_eq!(*c2.get_ref(), 3);
            assert_eq!(s1.get_deps().len(), 2);
        }
        s1.set(10);
        {
            assert_eq!(*c.get_ref(), 11);
            assert_eq!(*c2.get_ref(), 12);
            assert_eq!(s1.get_deps().len(), 2);
        }
        s1.set(2);
        {
            assert_eq!(*c.get_ref(), 3);
            assert_eq!(*c2.get_ref(), 4);
            assert_eq!(s1.get_deps().len(), 2);
            assert_eq!(s2.get_deps().len(), 2);
        }
        {
            let c_deps = c.get_deps();
            assert_eq!(c_deps.len(), 0);
        }
    }
}

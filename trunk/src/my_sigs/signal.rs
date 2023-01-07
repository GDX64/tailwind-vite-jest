use std::{
    cell::{Ref, RefCell, RefMut},
    rc::Rc,
};

use super::{
    computed::Computed,
    sig_traits::{SignalLike, Waker},
};

struct InnerSignal<T> {
    value: T,
    deps: Vec<Waker>,
}

impl<T: 'static> SignalLike for Signal<T> {
    type Value = T;
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

pub struct Signal<T> {
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
    pub fn new(value: T) -> Signal<T> {
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

    pub fn set(&self, value: T) {
        {
            let mut inner = self.inner.borrow_mut();
            inner.value = value;
        }
        self.notify();
    }

    pub fn update(&self, f: impl Fn(&mut T)) {
        {
            let val = &mut self.inner.borrow_mut().value;
            f(val);
        }
        self.notify();
    }
}

pub fn and_2<T: SignalLike, K: SignalLike, U: 'static>(
    one: &T,
    other: &K,
    f: impl Fn(&T::Value, &K::Value) -> U + 'static,
) -> impl SignalLike<Value = U> {
    let s1 = one.clone();
    let s2 = other.clone();
    Computed::new(move |waker| {
        let s1 = s1.get(waker);
        let s2 = s2.get(waker);
        f(&s1, &s2)
    })
}
pub fn and_3<T: SignalLike, K: SignalLike, G: SignalLike, U: 'static>(
    one: &T,
    two: &K,
    three: &G,
    f: impl Fn(&T::Value, &K::Value, &G::Value) -> U + 'static,
) -> impl SignalLike<Value = U> {
    let s1 = one.clone();
    let s2 = two.clone();
    let s3 = three.clone();
    Computed::new(move |waker| {
        let s1 = s1.get(waker);
        let s2 = s2.get(waker);
        let s3 = s3.get(waker);
        f(&s1, &s2, &s3)
    })
}

#[cfg(test)]
mod test {

    use super::{and_2, Signal, SignalLike};
    use crate::my_sigs::Computed;

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

    #[test]
    fn comps_of_comps() {
        let s1 = Signal::new(1);
        let s2 = Signal::new(1);
        let left = and_2(&s1, &s2, |v1, v2| *v1 + *v2);
        let right = and_2(&s1, &s2, |v1, v2| *v1 + *v2);
        let result = and_2(&left, &right, |l, r| *l + *r);
        {
            assert_eq!(*result.get_ref(), 4);
        }
        s1.set(2);
        {
            assert_eq!(*result.get_ref(), 6);
        }
        s2.set(2);
        {
            assert_eq!(*result.get_ref(), 8);
        }
    }

    #[test]
    fn test_trigger() {
        let s1 = Signal::new(1);
        let s2 = Signal::new(1);
        let s1_clone = s1.clone();
        let s2_clone = s2.clone();
        let comp = Computed::new(move |waker| *s1_clone.get(waker) + 1);
        {
            let v = comp.get_ref();
            assert_eq!(*v, 2);
        }
        comp.on_trigger(move || {
            s2_clone.set(10);
            true
        });
        {
            let v = s2.get_ref();
            assert_eq!(*v, 1)
        }
        {
            s1.set(4);
            let v = s2.get_ref();
            assert_eq!(*v, 10)
        }
    }
}

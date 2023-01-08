use super::sig_traits::notify;
use super::sig_traits::{SignalLike, Waker};
use std::{
    cell::{Ref, RefCell, RefMut},
    rc::Rc,
};

pub struct Computed<T: 'static, F: Fn(&Waker) -> T + 'static> {
    inner: Rc<InnerComputed<T, F>>,
    waker: Waker,
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> Computed<T, F> {
    fn with<K>(&self, f: impl Fn(&T) -> K) -> K {
        self.update_value_if_needed();
        let v = self.inner.value.borrow();
        let v = v.as_ref().unwrap();
        f(v)
    }

    fn update_value_if_needed(&self) {
        let mut awake = self.inner.awake.borrow_mut();
        if *awake {
            let v = (self.inner.f)(&self.waker);
            self.inner.value.replace(Some(v));
            *awake = false;
        }
    }

    pub fn new(f: F) -> Computed<T, F> {
        let inner = Rc::new(InnerComputed {
            value: RefCell::new(None),
            f,
            awake: RefCell::new(true),
            deps: RefCell::new(vec![]),
        });
        let weak_inner = Rc::downgrade(&inner);
        let waker = Rc::new(move || {
            weak_inner
                .upgrade()
                .map(|inner| {
                    inner.wakeup();
                })
                .is_some()
        });
        Computed { inner, waker }
    }
}

struct InnerComputed<T: 'static, F: Fn(&Waker) -> T + 'static> {
    value: RefCell<Option<T>>,
    f: F,
    awake: RefCell<bool>,
    deps: RefCell<Vec<Waker>>,
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> SignalLike for Computed<T, F> {
    type Value = T;
    fn with_track<K>(&self, waker: &Waker, f: impl Fn(&T) -> K) -> K {
        self.track(waker);
        self.with(f)
    }

    fn get_deps<'a>(&'a self) -> RefMut<'a, Vec<Waker>> {
        self.inner.deps.borrow_mut()
    }

    fn get_ref(&self) -> Ref<T> {
        self.update_value_if_needed();
        Ref::map(self.inner.value.borrow(), |v| v.as_ref().unwrap())
    }
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> Clone for Computed<T, F> {
    fn clone(&self) -> Self {
        Computed {
            inner: self.inner.clone(),
            waker: self.waker.clone(),
        }
    }
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> InnerComputed<T, F> {
    fn wakeup(&self) {
        self.awake.replace(true);
        notify(&mut self.deps.borrow_mut());
    }
}

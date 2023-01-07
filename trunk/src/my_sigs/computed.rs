use super::sig_traits::notify;
use super::sig_traits::{SignalLike, Waker};
use std::{
    cell::{Ref, RefCell, RefMut},
    rc::Rc,
};

pub struct Computed<T: 'static, F: Fn(&Waker) -> T + 'static> {
    inner: Rc<RefCell<InnerComputed<T, F>>>,
    waker: Waker,
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
            let v = (inner.f)(&self.waker);
            inner.value = Some(v);
            inner.awake = false;
        }
    }

    pub fn new(f: F) -> Computed<T, F> {
        let inner = Rc::new(RefCell::new(InnerComputed {
            value: None,
            f,
            awake: true,
            deps: vec![],
        }));
        let weak_inner = Rc::downgrade(&inner);
        let waker = Rc::new(move || {
            weak_inner
                .upgrade()
                .map(|inner| {
                    inner.borrow_mut().wakeup();
                })
                .is_some()
        });
        Computed { inner, waker }
    }
}

struct InnerComputed<T: 'static, F: Fn(&Waker) -> T + 'static> {
    value: Option<T>,
    f: F,
    awake: bool,
    deps: Vec<Waker>,
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> SignalLike for Computed<T, F> {
    type Value = T;
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

impl<T: 'static, F: Fn(&Waker) -> T + 'static> Clone for Computed<T, F> {
    fn clone(&self) -> Self {
        Computed {
            inner: self.inner.clone(),
            waker: self.waker.clone(),
        }
    }
}

impl<T: 'static, F: Fn(&Waker) -> T + 'static> InnerComputed<T, F> {
    fn wakeup(&mut self) {
        self.awake = true;
        notify(&mut self.deps);
    }
}

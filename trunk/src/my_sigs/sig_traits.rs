use std::{
    cell::{Ref, RefMut},
    rc::Weak,
};

pub trait SignalLike<T>: Clone + 'static {
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
        notify(self.get_deps().as_mut());
    }
}

pub trait InnerWaker {
    fn wakeup(&self);
}

pub type Waker = Weak<dyn InnerWaker>;

pub fn notify(deps: &mut Vec<Waker>) {
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

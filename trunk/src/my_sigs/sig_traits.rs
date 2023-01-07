use std::{
    cell::{Ref, RefMut},
    rc::Rc,
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
        if !deps.iter().any(|item| Rc::ptr_eq(item, &waker)) {
            deps.push(waker.clone());
        }
    }

    fn on_trigger(&self, f: impl Fn() -> bool + 'static) {
        let waker: Waker = Rc::new(f);
        self.track(&waker);
    }

    fn notify(&self) {
        notify(self.get_deps().as_mut());
    }
}

pub trait InnerWaker {
    fn wakeup(&self) -> bool;
}

pub type Waker = Rc<dyn InnerWaker>;

impl<F> InnerWaker for F
where
    F: Fn() -> bool,
{
    fn wakeup(&self) -> bool {
        (self)()
    }
}

pub fn notify(deps: &mut Vec<Waker>) {
    deps.retain(|waker| waker.wakeup());
}

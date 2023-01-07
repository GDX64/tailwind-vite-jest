use std::{
    borrow::Borrow,
    cell::{Ref, RefMut},
    future::Future,
    rc::Rc,
};

pub trait SignalLike: Clone + 'static {
    type Value;
    fn with_track<K>(&self, waker: &Waker, f: impl Fn(&Self::Value) -> K) -> K;

    fn get_ref(&self) -> Ref<Self::Value>;

    fn get(&self, waker: &Waker) -> Ref<Self::Value> {
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

    fn block_on<F: Fn(&Self::Value) -> bool>(self, f: F) -> SigBlocker<Self, F> {
        SigBlocker { s: self, f }
    }

    fn notify(&self) {
        notify(self.get_deps().as_mut());
    }
}

pub struct SigBlocker<S: SignalLike, F: Fn(&S::Value) -> bool> {
    s: S,
    f: F,
}

impl<S: SignalLike, F: Fn(&S::Value) -> bool> Future for SigBlocker<S, F> {
    type Output = ();
    fn poll(
        self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Self::Output> {
        let b = self.borrow();
        let finish = {
            let r = b.s.get_ref();
            (b.f)(&r)
        };
        if finish {
            return std::task::Poll::Ready(());
        }
        let my_waker = cx.waker().clone();
        b.s.on_trigger(move || {
            my_waker.wake_by_ref();
            false
        });
        std::task::Poll::Pending
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

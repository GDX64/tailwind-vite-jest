struct GenericNode<T> {
    inner: Rc<RefCell<InnerNode<T>>>,
    cx: Scope,
}

struct InnerNode<T> {
    children: Vec<GenericNode<T>>,
    value: Option<T>,
}

impl<T: 'static> GenericNode<T> {
    fn add_c(&self, node: impl Fn(Scope) -> GenericNode<T> + 'static) {
        let inner = self.inner.clone();
        let cx = self.cx.clone();
        create_effect(self.cx, move |disp: Option<ScopeDisposer>| {
            let mut inner_borrow = inner.borrow_mut();
            if let Some(disposer) = disp {
                disposer.dispose();
            }
            let dispose = cx.child_scope(|cx| {
                if inner_borrow.children.len() >= 1 {
                    inner_borrow.children[0] = node(cx);
                } else {
                    inner_borrow.children.push(node(cx))
                }
            });
            dispose
        })
    }

    fn new(cx: Scope, value: Option<T>) -> GenericNode<T> {
        GenericNode {
            inner: Rc::new(RefCell::new(InnerNode {
                children: vec![],
                value,
            })),
            cx,
        }
    }
}

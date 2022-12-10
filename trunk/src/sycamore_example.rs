use sycamore::prelude::*;
use sycamore::{builder::prelude::*, component};
use wasm_bindgen::JsError;
use web_sys::{window, Node};

fn find_place() -> Option<Node> {
    let body = window()?.document()?.body()?;
    let node = Node::from(body);
    Some(node)
}

pub fn main() {
    start_view().ok();
}

fn start_view() -> Result<(), JsError> {
    let place = find_place().ok_or(JsError::new("naum deu"))?;
    sycamore::render_to(
        |cx| {
            let sig = create_signal(cx, "hello");
            let show = create_signal(cx, true);
            let r = div()
                .dyn_t(|| sig.get().to_string())
                .on("click", |_| sig.set("holla"))
                .dyn_c(|| t("hi"))
                .dyn_c(move || {
                    if *show.get() {
                        Hello(cx, show)
                    } else {
                        div().view(cx)
                    }
                });
            r.view(cx)
        },
        &place,
    );
    Ok(())
}

#[component]
fn Hello<G: Html, 'a>(cx: Scope<'a>, value: &'a Signal<bool>) -> View<G> {
    input()
        .attr("type", "checkbox")
        .on("input", |_| value.set(!*value.get()))
        .view(cx)
}

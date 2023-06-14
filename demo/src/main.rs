#![allow(non_snake_case)]
// import the prelude to get access to the `rsx!` macro and the `Scope` and `Element` types
use dioxus::prelude::*;

fn main() {
    // launch the web app
    dioxus_web::launch(App);
}

// create a component that renders a div with the text "Hello, world!"
fn App(cx: Scope) -> Element {
    cx.render(rsx! {
        div {
            color: "red",
            "Hello, world!"
        }
        my_comp {label: "hello", color: "green"}
    })
}

#[inline_props]
fn my_comp(cx: Scope, label: &'static str, color: Option<&'static str>) -> Element {
    render!(div { color: color.unwrap_or("black"), "{label}" })
}

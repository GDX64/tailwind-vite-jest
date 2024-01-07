#![allow(non_snake_case)]
mod local_messager;
mod login_machine;
mod messager_things;
use anyhow::Result;
use dioxus::prelude::*;
use login_machine::{LoginStates, UserResult};
use messager_things::UserData;
use tokio_stream::StreamExt;

fn main() {
    // launch the dioxus app in a webview
    dioxus_desktop::launch(App);
}

#[derive(Debug)]
enum UIStates {
    FillUser,
    FillPassword,
    SignUp,
    TwoFactor,
    LoggedIn,
}

enum UIEvents {
    User(UserData),
    Password(UserData),
    TwoFactor(UserData),
    SignUp,
    Login,
}

// define a component that renders a div with the text "Hello, world!"
fn App(cx: Scope) -> Element {
    let curr_state = use_state(cx, || UIStates::FillUser);
    let cor = use_coroutine(cx, |rx: UnboundedReceiver<UIEvents>| {
        let curr_state = curr_state.clone();
        async move {
            if let Err(err) = handle_login_states(rx, curr_state).await {
                println!("Error: {:?}", err);
            }
        }
    });

    match curr_state.get() {
        UIStates::FillUser => {
            return cx.render(rsx! {
                InsertUser {
                    on_login: move |event| cor.send(event),
                }
            });
        }
        _ => {
            return cx.render(rsx! {
               div {
                    "another state"
               }
            });
        }
    }
}

async fn handle_login_states(
    mut rx: UnboundedReceiver<UIEvents>,
    curr_state: UseState<UIStates>,
) -> Result<()> {
    let machine = login_machine::Login::new(local_messager::LocalMessager::new().await);
    let mut machine = LoginStates::FillUser(machine);
    loop {
        match rx.next().await {
            Some(UIEvents::User(user)) => {
                machine = match machine {
                    LoginStates::FillUser(login) => {
                        match login.go_to_password(user.user).await {
                            UserResult::Ok(login) => {
                                curr_state.set(UIStates::FillPassword);
                                LoginStates::FillPassword(login)
                            }
                            UserResult::InvalidUser(login) => LoginStates::FillUser(login),
                        }
                    }
                    _ => machine,
                };
                curr_state.set(UIStates::FillPassword);
            }
            _ => continue,
        }
    }
}

#[derive(Props)]
struct InsertUserProps<'a> {
    on_login: EventHandler<'a, UIEvents>,
}

fn InsertUser<'a>(cx: Scope<'a, InsertUserProps<'a>>) -> Element<'a> {
    let user = use_state(cx, || "".to_string());
    cx.render(rsx! {
        div {
            display: "flex",
            flex_direction: "column",
            align_items: "start",

            label {
                "Username: "
            }
            input {
                oninput: |event| {
                    user.set(event.value.clone());
                }
            }
            button {
                onclick: move |_| {
                    cx.props.on_login.call(UIEvents::User(UserData{
                        user: user.get().clone(),
                        password: None,
                        two_factor_code: None,
                    }));
                },
                "Next"
            }
        }
    })
}

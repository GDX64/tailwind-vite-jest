use crate::messager_things::{Messager, PasswordResult, UserData};
use async_trait::async_trait;
use std::{borrow::BorrowMut, cell::RefCell, collections::HashMap};
use tokio::sync::Mutex;

struct User {
    name: String,
    password: String,
    needs_two_factor: bool,
}

pub struct LocalMessager {
    users: Mutex<HashMap<String, User>>,
}

impl LocalMessager {
    pub async fn new() -> Self {
        let me = LocalMessager {
            users: Mutex::new(HashMap::new()),
        };
        me.add_user("gabriel", "123").await;
        me
    }

    pub async fn add_user(&self, name: impl Into<String>, password: impl Into<String>) {
        let name = name.into();
        self.users.lock().await.insert(
            name.clone(),
            User {
                name: name.clone(),
                password: password.into(),
                needs_two_factor: false,
            },
        );
    }
}

#[async_trait]
impl Messager for LocalMessager {
    async fn sign_up(&self, data: UserData) -> bool {
        let locked = self.users.lock().await;
        if locked.contains_key(&data.user) {
            return false;
        }
        if let Some(password) = data.password {
            self.add_user(data.user, password).await;
            true
        } else {
            false
        }
    }

    async fn verify_user(&self, user: UserData) -> bool {
        self.users.lock().await.contains_key(&user.user)
    }

    async fn verify_password(&self, data: UserData) -> PasswordResult {
        let password = if let Some(password) = data.password {
            password
        } else {
            return PasswordResult::WrongPassword;
        };
        if let Some(user) = self.users.lock().await.get(&data.user) {
            if user.password == password {
                if user.needs_two_factor {
                    PasswordResult::TwoFactorRequired
                } else {
                    PasswordResult::Ok
                }
            } else {
                PasswordResult::WrongPassword
            }
        } else {
            PasswordResult::WrongPassword
        }
    }
    async fn verify_2fa(&self, data: UserData) -> bool {
        data.two_factor_code.unwrap_or("".to_string()) == "123"
    }
}

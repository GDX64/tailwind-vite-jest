use crate::messager_things::{self, Messager};

pub struct Login<T> {
    state: T,
    messager: Box<dyn Messager>,
}

pub struct FillUser;

pub struct FillPassword {
    user: String,
}

pub struct TwoFactor {
    user: String,
    password: String,
}

pub struct LoggedIn {
    user: String,
    password: String,
}

pub enum UserResult {
    Ok(Login<FillPassword>),
    InvalidUser(Login<FillUser>),
}

impl Login<FillUser> {
    pub fn new(messager: impl Messager + 'static) -> Self {
        Login {
            state: FillUser,
            messager: Box::new(messager),
        }
    }

    pub async fn go_to_password(self, user: String) -> UserResult {
        if self.messager.verify_user(user.clone()).await {
            UserResult::Ok(Login {
                state: FillPassword { user },
                messager: self.messager,
            })
        } else {
            UserResult::InvalidUser(self)
        }
    }
}

pub enum LoginPasswordResult {
    TwoFactor(Login<TwoFactor>),
    LoggedIn(Login<LoggedIn>),
    WrongPassword(Login<FillPassword>),
}

impl Login<FillPassword> {
    pub async fn login(self, password: String) -> LoginPasswordResult {
        match self
            .messager
            .verify_password(self.state.user.clone(), password.clone())
            .await
        {
            messager_things::PasswordResult::Ok => {
                LoginPasswordResult::LoggedIn(Login {
                    state: LoggedIn {
                        user: self.state.user,
                        password,
                    },
                    messager: self.messager,
                })
            }
            messager_things::PasswordResult::TwoFactorRequired => {
                LoginPasswordResult::TwoFactor(Login {
                    state: TwoFactor {
                        user: self.state.user,
                        password,
                    },
                    messager: self.messager,
                })
            }
            messager_things::PasswordResult::WrongPassword => {
                LoginPasswordResult::WrongPassword(Login {
                    state: FillPassword {
                        user: self.state.user,
                    },
                    messager: self.messager,
                })
            }
        }
    }
}

pub enum TwoFactorResult {
    Ok(Login<LoggedIn>),
    WrongCode(Login<TwoFactor>),
}

impl Login<TwoFactor> {
    pub async fn login(self, code: String) -> TwoFactorResult {
        let result = self
            .messager
            .verify_2fa(self.state.user.clone(), self.state.password.clone(), code)
            .await;
        if result {
            return TwoFactorResult::Ok(Login {
                state: LoggedIn {
                    user: self.state.user,
                    password: self.state.password,
                },
                messager: self.messager,
            });
        } else {
            TwoFactorResult::WrongCode(self)
        }
    }
}

// #[cfg(test)]
// mod tests {
//     use crate::messager_things::PasswordResult;

//     use super::*;

//     #[tokio::test]
//     async fn test_login() {
//         let dummy = messager_things::DummyMessager::default();
//         let login = Login::new(dummy)
//             .go_to_password("user".to_string())
//             .await
//             .expect("Failed to go to password")
//             .login("password".to_string())
//             .await
//             .expect("failed to login");
//         match login {
//             LoginPasswordResult::LoggedIn(login) => {
//                 let LoggedIn { user, password } = login.state;
//                 assert_eq!(user, "user");
//                 assert_eq!(password, "password");
//             }
//             _ => panic!("Invalid state"),
//         }
//     }

//     #[tokio::test]
//     async fn two_factor() {
//         let mut dummy = messager_things::DummyMessager::default();
//         dummy.verify_password = Box::new(|_, _| PasswordResult::TwoFactorRequired);
//         let login = Login::new(dummy)
//             .go_to_password("user".to_string())
//             .await
//             .expect("Failed to go to password")
//             .login("password".to_string())
//             .await
//             .expect("failed to login");
//         match login {
//             LoginPasswordResult::TwoFactor(login) => {
//                 let TwoFactor { user, password } = &login.state;
//                 assert_eq!(user, "user");
//                 assert_eq!(password, "password");

//                 match login.login("123".to_string()).await {
//                     Ok(login) => {
//                         let LoggedIn { user, password } = login.state;
//                         assert_eq!(user, "user");
//                         assert_eq!(password, "password");
//                     }
//                     Err(_) => panic!("Failed to login"),
//                 }
//             }
//             _ => panic!("Invalid state"),
//         }
//     }
// }

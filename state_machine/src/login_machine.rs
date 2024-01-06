use crate::messager_things::{self, Messager, UserData};

pub struct Login<T> {
    state: T,
    messager: Box<dyn Messager>,
    user_data: UserData,
}

pub struct FillUser;

pub struct FillPassword {}

pub struct TwoFactor {}

pub struct LoggedIn {}

pub enum UserResult {
    Ok(Login<FillPassword>),
    InvalidUser(Login<FillUser>),
}

impl Login<FillUser> {
    pub fn new(messager: impl Messager + 'static) -> Self {
        Login {
            state: FillUser,
            messager: Box::new(messager),
            user_data: UserData {
                user: "".to_string(),
                password: None,
                two_factor_code: None,
            },
        }
    }

    pub async fn go_to_password(self, user: String) -> UserResult {
        let user_data = UserData {
            user,
            password: None,
            two_factor_code: None,
        };
        if self.messager.verify_user(user_data.clone()).await {
            UserResult::Ok(Login {
                state: FillPassword {},
                messager: self.messager,
                user_data,
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
        let user_data = UserData {
            user: self.user_data.user,
            password: Some(password.clone()),
            two_factor_code: None,
        };
        match self.messager.verify_password(user_data.clone()).await {
            messager_things::PasswordResult::Ok => {
                LoginPasswordResult::LoggedIn(Login {
                    state: LoggedIn {},
                    messager: self.messager,
                    user_data,
                })
            }
            messager_things::PasswordResult::TwoFactorRequired => {
                LoginPasswordResult::TwoFactor(Login {
                    state: TwoFactor {},
                    messager: self.messager,
                    user_data,
                })
            }
            messager_things::PasswordResult::WrongPassword => {
                LoginPasswordResult::WrongPassword(Login {
                    state: FillPassword {},
                    messager: self.messager,
                    user_data,
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
        let user_data = UserData {
            user: self.user_data.user.clone(),
            password: self.user_data.password.clone(),
            two_factor_code: Some(code.clone()),
        };
        let result = self.messager.verify_2fa(user_data.clone()).await;
        if result {
            return TwoFactorResult::Ok(Login {
                state: LoggedIn {},
                messager: self.messager,
                user_data,
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

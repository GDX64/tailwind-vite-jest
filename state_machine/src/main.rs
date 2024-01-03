use anyhow::Result;
mod messager_things;
use messager_things::Messager;

fn main() {
    println!("Hello, world!");
}

struct Login<T> {
    state: T,
    messager: Box<dyn Messager>,
}

struct FillUser;

struct FillPassword {
    user: String,
}

struct TwoFactor {
    user: String,
    password: String,
}

struct LoggedIn {
    user: String,
    password: String,
}

impl Login<FillUser> {
    fn new(messager: impl Messager + 'static) -> Self {
        Login {
            state: FillUser,
            messager: Box::new(messager),
        }
    }

    fn go_to_password(self, user: String) -> Result<Login<FillPassword>> {
        if self.messager.verify_user(user.clone()) {
            Ok(Login {
                state: FillPassword { user },
                messager: self.messager,
            })
        } else {
            Err(anyhow::anyhow!("Invalid user"))
        }
    }
}

enum LoginPasswordResult {
    TwoFactor(Login<TwoFactor>),
    LoggedIn(Login<LoggedIn>),
}

impl Login<FillPassword> {
    fn login(self, password: String) -> Result<LoginPasswordResult> {
        match self
            .messager
            .verify_password(self.state.user.clone(), password.clone())
        {
            messager_things::PasswordResult::Ok => {
                Ok(LoginPasswordResult::LoggedIn(Login {
                    state: LoggedIn {
                        user: self.state.user,
                        password,
                    },
                    messager: self.messager,
                }))
            }
            messager_things::PasswordResult::TwoFactorRequired => {
                Ok(LoginPasswordResult::TwoFactor(Login {
                    state: TwoFactor {
                        user: self.state.user,
                        password,
                    },
                    messager: self.messager,
                }))
            }
            messager_things::PasswordResult::WrongPassword => {
                Err(anyhow::anyhow!("Wrong password"))
            }
        }
    }
}

impl Login<TwoFactor> {
    fn login(self, code: String) -> Login<LoggedIn> {
        Login {
            state: LoggedIn {
                user: self.state.user,
                password: self.state.password,
            },
            messager: self.messager,
        }
    }
}

enum LoginStates {
    FillUser(Login<FillUser>),
    FillPassword(Login<FillPassword>),
    LoggedIn(Login<LoggedIn>),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_login() {
        let dummy = messager_things::DummyMessager::default();
        let login = Login::new(dummy)
            .go_to_password("user".to_string())
            .expect("Failed to go to password")
            .login("password".to_string())
            .expect("failed to login");
        match login {
            LoginPasswordResult::LoggedIn(login) => {
                let LoggedIn { user, password } = login.state;
                assert_eq!(user, "user");
                assert_eq!(password, "password");
            }
            _ => panic!("Invalid state"),
        }
    }
}

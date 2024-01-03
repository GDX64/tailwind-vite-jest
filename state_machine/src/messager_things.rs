pub enum PasswordResult {
    Ok,
    TwoFactorRequired,
    WrongPassword,
}

pub trait Messager {
    fn verify_user(&self, user: String) -> bool;
    fn verify_password(&self, user: String, password: String) -> PasswordResult;
    fn verify_2fa(&self, user: String, password: String, code: String) -> bool;
}

pub struct DummyMessager {
    verify_user: Box<dyn Fn(String) -> bool>,
    verify_password: Box<dyn Fn(String, String) -> PasswordResult>,
    verify_2fa: Box<dyn Fn(String, String, String) -> bool>,
}

impl Default for DummyMessager {
    fn default() -> Self {
        DummyMessager {
            verify_user: Box::new(|_| true),
            verify_password: Box::new(|_, _| PasswordResult::Ok),
            verify_2fa: Box::new(|_, _, _| true),
        }
    }
}

impl Messager for DummyMessager {
    fn verify_user(&self, user: String) -> bool {
        (self.verify_user)(user)
    }

    fn verify_password(&self, user: String, password: String) -> PasswordResult {
        (self.verify_password)(user, password)
    }

    fn verify_2fa(&self, user: String, password: String, code: String) -> bool {
        (self.verify_2fa)(user, password, code)
    }
}

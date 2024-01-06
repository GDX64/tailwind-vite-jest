use async_trait::async_trait;

pub enum PasswordResult {
    Ok,
    TwoFactorRequired,
    WrongPassword,
}

#[async_trait]
pub trait Messager {
    async fn verify_user(&self, data: UserData) -> bool;
    async fn verify_password(&self, data: UserData) -> PasswordResult;
    async fn verify_2fa(&self, data: UserData) -> bool;
    async fn sign_up(&self, data: UserData) -> bool {
        false
    }
}

#[derive(Clone)]
pub struct UserData {
    pub user: String,
    pub password: Option<String>,
    pub two_factor_code: Option<String>,
}

pub struct DummyMessager {
    pub verify_user: Box<dyn Fn(UserData) -> bool + Send + Sync>,
    pub verify_password: Box<dyn Fn(UserData) -> PasswordResult + Send + Sync>,
    pub verify_2fa: Box<dyn Fn(UserData) -> bool + Send + Sync>,
}

impl Default for DummyMessager {
    fn default() -> Self {
        DummyMessager {
            verify_user: Box::new(|_| true),
            verify_password: Box::new(|_| PasswordResult::Ok),
            verify_2fa: Box::new(|_| true),
        }
    }
}

#[async_trait]
impl Messager for DummyMessager {
    async fn verify_user(&self, user: UserData) -> bool {
        (self.verify_user)(user)
    }

    async fn verify_password(&self, user: UserData) -> PasswordResult {
        (self.verify_password)(user)
    }

    async fn verify_2fa(&self, user: UserData) -> bool {
        (self.verify_2fa)(user)
    }
}

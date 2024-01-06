use anyhow::Result;
mod messager_things;
use tokio::io::{AsyncBufReadExt, BufReader};
mod login_machine;
use login_machine::{
    FillPassword, FillUser, LoggedIn, Login, LoginPasswordResult, TwoFactor, TwoFactorResult,
    UserResult,
};

#[tokio::main]
async fn main() -> Result<()> {
    let mut messager = messager_things::DummyMessager::default();
    messager.verify_user = Box::new(|user| user == "gabriel");
    messager.verify_password = Box::new(|user, password| {
        if user == "gabriel" && password == "123" {
            messager_things::PasswordResult::Ok
        } else if user == "gabriel" && password == "456" {
            messager_things::PasswordResult::TwoFactorRequired
        } else {
            messager_things::PasswordResult::WrongPassword
        }
    });
    messager.verify_2fa = Box::new(|user, password, code| {
        if user == "gabriel" && password == "456" && code == "123" {
            true
        } else {
            false
        }
    });
    let login_machine = Login::new(messager);

    let password_machine = complete_user_stage(login_machine).await?;
    complete_password_stage(password_machine).await?;
    println!("Logged in!!!");
    Ok(())
}

async fn complete_user_stage(mut login_machine: Login<FillUser>) -> Result<Login<FillPassword>> {
    loop {
        println!("Enter your username: ");
        let password = read_one_line().await?;
        match login_machine.go_to_password(password).await {
            UserResult::Ok(login) => return Ok(login),
            UserResult::InvalidUser(login) => {
                println!("Invalid user, try again");
                login_machine = login;
            }
        }
    }
}

async fn complete_password_stage(
    mut login_machine: Login<FillPassword>,
) -> Result<Login<LoggedIn>> {
    loop {
        println!("Enter your password: ");
        let password = read_one_line().await?;
        match login_machine.login(password).await {
            LoginPasswordResult::LoggedIn(login) => return Ok(login),
            LoginPasswordResult::TwoFactor(login) => {
                let logged = complete_2fa_stage(login).await?;
                return Ok(logged);
            }
            LoginPasswordResult::WrongPassword(login) => {
                println!("Wrong password, try again");
                login_machine = login;
            }
        }
    }
}

async fn complete_2fa_stage(mut login_machine: Login<TwoFactor>) -> Result<Login<LoggedIn>> {
    loop {
        println!("Enter your 2fa code: ");
        let code = read_one_line().await?;
        match login_machine.login(code).await {
            TwoFactorResult::Ok(login) => return Ok(login),
            TwoFactorResult::WrongCode(login) => {
                println!("Wrong code, try again");
                login_machine = login;
            }
        }
    }
}

async fn read_one_line() -> Result<String> {
    let mut line = String::new();
    let mut reader = BufReader::new(tokio::io::stdin());
    reader.read_line(&mut line).await?;
    Ok(line.trim().to_string())
}

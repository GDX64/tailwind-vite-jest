use anyhow::Result;
mod messager_things;
use tokio::io::{AsyncBufReadExt, BufReader};
mod login_machine;
use login_machine::{
    FillPassword, FillUser, LoggedIn, Login, LoginPasswordResult, TwoFactor, TwoFactorResult,
    UserResult,
};
mod local_messager;

#[tokio::main]
async fn main() -> Result<()> {
    let messager = local_messager::LocalMessager::new().await;
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

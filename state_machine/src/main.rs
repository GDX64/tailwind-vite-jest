use anyhow::Result;
mod messager_things;
use tokio::io::{AsyncBufReadExt, BufReader};
mod login_machine;
use login_machine::{
    FillPassword, FillUser, Login, LoginPasswordResult, LoginStates, TwoFactor, TwoFactorResult,
    UserResult,
};
mod local_messager;

#[tokio::main]
async fn main() -> Result<()> {
    let messager = local_messager::LocalMessager::new().await;
    let login_machine = Login::new(messager);
    let mut curr_state = complete_user_stage(login_machine).await?;
    loop {
        match curr_state {
            LoginStates::FillUser(login) => {
                curr_state = complete_user_stage(login).await?;
            }
            LoginStates::FillPassword(login) => {
                curr_state = complete_password_stage(login).await?;
            }
            LoginStates::TwoFactor(login) => {
                curr_state = complete_2fa_stage(login).await?;
            }
            LoginStates::LoggedIn(_) => {
                break;
            }
        }
    }
    println!("You are logged in!!!");
    Ok(())
}

async fn complete_user_stage(login_machine: Login<FillUser>) -> Result<LoginStates> {
    println!("Enter your username: ");
    let password = read_one_line().await?;
    match login_machine.go_to_password(password).await {
        UserResult::Ok(login) => return Ok(LoginStates::FillPassword(login)),
        UserResult::InvalidUser(login) => {
            println!("Invalid user, try again");
            return Ok(LoginStates::FillUser(login));
        }
    }
}

async fn complete_password_stage(login_machine: Login<FillPassword>) -> Result<LoginStates> {
    println!("Enter your password: ");
    let password = read_one_line().await?;
    match login_machine.login(password).await {
        LoginPasswordResult::LoggedIn(login) => return Ok(LoginStates::LoggedIn(login)),
        LoginPasswordResult::TwoFactor(login) => return Ok(LoginStates::TwoFactor(login)),
        LoginPasswordResult::WrongPassword(login) => {
            println!("Wrong password, try again");
            return Ok(LoginStates::FillPassword(login));
        }
    }
}

async fn complete_2fa_stage(login_machine: Login<TwoFactor>) -> Result<LoginStates> {
    println!("Enter your 2fa code: ");
    let code = read_one_line().await?;
    match login_machine.login(code).await {
        TwoFactorResult::Ok(login) => return Ok(LoginStates::LoggedIn(login)),
        TwoFactorResult::WrongCode(login) => {
            println!("Wrong code, try again");
            Ok(LoginStates::TwoFactor(login))
        }
    }
}

async fn read_one_line() -> Result<String> {
    let mut line = String::new();
    let mut reader = BufReader::new(tokio::io::stdin());
    reader.read_line(&mut line).await?;
    Ok(line.trim().to_string())
}

enum ConnectionStatus {
  Logged,
  Open,
  Closed,
}

type LoginData = {
  username: string;
  password: string;
  pin?: number;
  license?: string;
};

enum LoginResultKind {
  Success,
  WrongPassword,
  TFARequired,
}

type LResult<T, Data> = { code: T; data: Data };

type LoginResult =
  | LResult<LoginResultKind.Success, { connection: Connection }>
  | LResult<LoginResultKind.WrongPassword, {}>
  | LResult<LoginResultKind.TFARequired, {}>;

interface Connection {
  connectionLost(): Promise<void>;
}

interface Messager {
  login(data: LoginData): Promise<LoginResult>;
  connectionStatus(): AsyncGenerator<ConnectionStatus>;
}

export class LoginLogic {
  constructor(private messager: Messager) {}

  async makeLogin(data: LoginData) {
    const result = await this.messager.login(data);
    if (result.code === LoginResultKind.Success) {
      this.keepConnection(result.data.connection);
      return {
        kind: LoginResultKind.Success,
      };
    }
    if (result.code === LoginResultKind.WrongPassword) {
      return {
        kind: LoginResultKind.WrongPassword,
      };
    }
    if (result.code === LoginResultKind.TFARequired) {
      return {
        kind: LoginResultKind.TFARequired,
      };
    }
  }

  private async keepConnection(connection: Connection) {
    while (true) {
      await connection.connectionLost();
    }
  }
}

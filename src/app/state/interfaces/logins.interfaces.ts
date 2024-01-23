export interface ILoginsState {
  [environment: string]: ILogin;
}

export interface ILogin {
  token?: string;
  loading?: boolean;
  valid?: boolean;
}

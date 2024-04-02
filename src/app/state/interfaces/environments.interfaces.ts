import { Environments } from 'src/app/config';
import { ILogin } from './logins.interfaces';

export interface IEnvironment {
  env: Environments;
  normalized: string;
  name: string;
  slug?: string;
  token_expiration: number;
  login_user?: string;
  login_password?: string;
}

export type IEnvironmentsState = {
  [env in Environments]?: IEnvironment[];
};

export type IEnvironmentsWithLoginInfo = {
  [env in Environments]?: (IEnvironment & ILogin)[];
};

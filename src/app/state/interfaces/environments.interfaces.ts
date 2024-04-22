import { Servers } from 'src/app/config';
import { ILogin } from './logins.interfaces';

export interface IEnvironment {
  server: Servers;
  normalized: string;
  name: string;
  slug?: string;
  token_expiration: number;
  login_user?: string;
  login_password?: string;
}

export type IEnvironmentsState = {
  [server in Servers]?: IEnvironment[];
};

export type IEnvironmentsWithLoginInfo = {
  [server in Servers]?: (IEnvironment & ILogin)[];
};

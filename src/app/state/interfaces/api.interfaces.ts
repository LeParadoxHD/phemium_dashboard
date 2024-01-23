import { IApiEntity, IApiMethod, IApiMethodGroup } from 'src/app/interfaces';
import { Environments } from 'src/app/config';

export type IApiState = {
  [env in Environments]?: IApi;
};

export interface IApi {
  version?: string;
  endpoint?: string;
  loading?: boolean;
  lastUpdate?: number;
  entities?: IApiEntity[];
  apis?: IApiMethodGroup[];
}

export type IApiEnvironments = 'integra' | 'prerelease' | 'live' | 'aws';

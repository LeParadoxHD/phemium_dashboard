import { Servers } from 'src/app/config';
import { IApiEntity, IApiMethodGroup } from 'src/app/interfaces';
import { EntitySchema } from 'src/app/services/editor.service';

export type IApiState = {
  [server in Servers]?: IApi;
};

export interface IApi {
  version?: string;
  endpoint?: string;
  loading?: boolean;
  lastUpdate: number;
  entities?: IApiEntity[];
  jsonSchemas?: EntitySchema[];
  apis?: IApiMethodGroup[];
  server: Servers;
}

export type IApiServers = 'integra' | 'prerelease' | 'live' | 'aws';

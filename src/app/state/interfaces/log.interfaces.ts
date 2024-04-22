import { HttpResponse } from '@angular/common/http';

export interface ILog {
  statusCode: number;
  entity: string;
  action: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';
  url: string;
  responseTime: number;
  responseSize: number;
  response: HttpResponse<any>;
  datetime: number;
}

export interface ILogsState {
  logs: ILog[];
  limit: number;
  filter?: 'all' | 'success' | 'warning' | 'error';
}

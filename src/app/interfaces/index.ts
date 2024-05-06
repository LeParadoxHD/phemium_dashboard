import { HttpResponse } from '@angular/common/http';
import { Servers } from '../config';

export interface IApiMethodGroup {
  name: string;
  short_description: string;
  long_description: string;
  methods: IApiMethod[];
  /* Normalized method name [Calculated] */
  normalized: string;
  /* Used for @memoization */
  server: Servers;
}

export interface IApiMethod {
  name: string;
  params: IApiMethodParams[];
  auth: IApiMethodAuth;
  /* Group of method [Calculated] */
  group: Omit<IApiMethodGroup, 'methods'>;
  /* Icon of method [Calculated] */
  icon: string;
  /* ID of the method [Calculated] */
  id: string;
  /* Normalized method name [Calculated] */
  normalized: string;
  /* Used for @memoization */
  server: Servers;
}

export type IParamType = 'integer' | 'int' | 'string' | 'boolean' | 'bool' | 'list_options';

export interface IApiMethodParams {
  name: string;
  is_primitive: boolean;
  type: IParamType[];
  /* Normalized method name [Calculated] */
  normalized: string;
}

export interface IApiMethodAuth {
  required: boolean;
  access: IApiAccessType[];
}

export enum IApiAccessType {
  Customer = 'customer',
  CustomerUser = 'customer_user',
  Enduser = 'enduser'
}

export interface IApiEntity {
  name: string;
  short_description: string;
  long_description: string;
  properties: IApiEntityProperty[];
}

export interface IApiEntityProperty {
  name: string;
  type: 'integer' | 'string' | 'boolean' | 'int' | 'boolean' | any;
  default_value: any;
}

export interface IApiConfigs {
  [env: string]: IApiConfig;
}

export interface IApiConfig {
  id: Servers;
  name: string;
  secure: boolean;
  domain: string;
  path: string;
  /* Whether or not any action done in this environment should be confirmed */
  confirm_actions: boolean;
}

export interface IView {
  api: IApiMethod;
  parameters: any[];
  /* Used when some parameter has multiple types */
  virtualParameters?: Record<string, any>;
  result?: IViewResult;
  loading?: boolean;
}

export interface IViewResult {
  request: IViewRequest;
  response: IViewResponse;
  name?: string;
  date: number;
}

export interface IApiMethodParamsValue extends IApiMethodParams {
  value: any;
}

export interface IViewRequest {
  parameters?: IApiMethodParamsValue[];
  headers?: Record<string, string>;
}

export type AddEdit = 'add' | 'edit';

export interface CustomHttpResponse extends Omit<HttpResponse<Object>, 'headers'> {
  headers: Record<string, string>;
  responseTime?: number;
}

export type IViewResponse = CustomHttpResponse;

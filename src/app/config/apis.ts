import { IApiConfig } from '../interfaces';

export const ApisConfig: IApiConfig[] = [
  {
    id: 'integra',
    name: 'Integra',
    confirm_actions: false,
    secure: true,
    domain: 'api-integra.phemium.com',
    path: '/v1/api'
  },
  {
    id: 'prerelease',
    name: 'Prerelease',
    confirm_actions: false,
    secure: true,
    domain: 'api-prerelease.phemium.com',
    path: '/v1/api'
  },
  {
    id: 'live',
    name: 'Live',
    confirm_actions: true,
    secure: true,
    domain: 'api-live.phemium.com',
    path: '/v1/api'
  },
  {
    id: 'aws',
    name: 'AWS',
    confirm_actions: true,
    secure: true,
    domain: 'api.phemium.com',
    path: '/v1/api'
  }
];

export type Servers = 'integra' | 'prerelease' | 'live' | 'aws';

export enum ListOptionsOperators {
  FL_BEGINS = 'begins',
  FL_BIGGER = 'bigger',
  FL_BIGGER_EQUALS = 'bigger_equals',
  FL_CONTAINS = 'contains',
  FL_CONTAINS_ID = 'contains_id',
  FL_ENDS = 'ends',
  FL_EQUALS = 'equals',
  FL_IN = 'in',
  FL_INTEGER_BIGGER = 'integer_bigger',
  FL_INTEGER_BIGGER_EQUALS = 'integer_bigger_equals',
  FL_INTEGER_EQUAL = 'integer_equal',
  FL_INTEGER_LOWER = 'integer_lower',
  FL_INTEGER_LOWER_EQUALS = 'integer_lower_equals',
  FL_INTEGER_NOT_EQUAL = 'integer_not_equal',
  FL_IS_NOT_NULL = 'is_not_null',
  FL_IS_NULL = 'is_null',
  FL_LOWER = 'lower',
  FL_LOWER_EQUALS = 'lower_equals',
  FL_NOT_EQUAL = 'not_equals',
  FL_NOT_IN = 'not_in',
  FL_STRING_IN = 's_in',
  FL_STRING_NOT_IN = 's_not_in'
}

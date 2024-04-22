import { HttpHeaders } from '@angular/common/http';
import { IApiMethodGroup, IApiMethodParams, IViewResponse } from '../interfaces';
import { Servers } from '../config';

export function NormalizeMethodGroupName(name: string) {
  const parts = name.split('_');
  if (parts[0]) parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  return parts.join(' ');
}

export function NormalizeMethodName(name: string) {
  const parts = name.split('_');
  if (parts[0]) parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  return parts.join(' ');
}

export function NormalizeMethodParamName(name: string) {
  return name
    .split('_')
    .map((part, index) => {
      if (index === 0) {
        part = part.charAt(0).toUpperCase() + part.slice(1);
      }
      if (part.toLowerCase() === 'id') part = 'ID';
      return part;
    })
    .join(' ');
}

export function GetMethodIcon(name: string) {
  name = name.toLowerCase().trim();
  if (
    name.startsWith('create_') ||
    name.startsWith('generate_') ||
    name.startsWith('add_') ||
    name.startsWith('register_')
  ) {
    return 'plus';
  }
  if (
    name.startsWith('modify_') ||
    name.startsWith('update_') ||
    name.startsWith('set_') ||
    name.startsWith('change_') ||
    name.startsWith('assign_') ||
    name.startsWith('associate_')
  ) {
    return 'edit';
  }
  if (name.startsWith('remove_') || name.startsWith('delete_') || name.startsWith('clear_')) {
    return 'delete';
  }
  if (name.startsWith('answer_')) {
    return 'comment';
  }
  if (name.startsWith('disable_')) {
    return 'minus-square';
  }
  if (name.startsWith('download_')) {
    return 'download';
  }
  if (name.startsWith('login_')) {
    return 'login';
  }
  if (name.startsWith('logout')) {
    return 'logout';
  }
  if (name.startsWith('regenerate_') || name.startsWith('renew')) {
    return 'reload';
  }
  if (name.startsWith('enable_') || name.startsWith('activate_')) {
    return 'plus-square';
  }
  if (name.startsWith('check_') || name.startsWith('is_') || name.startsWith('has_')) {
    return 'question';
  }
  if (name.startsWith('validate_') || name.startsWith('confirm_') || name.startsWith('accept_')) {
    return 'check';
  }
  if (name.startsWith('close_')) {
    return 'close';
  }
  if (name.startsWith('cancel_')) {
    return 'stop';
  }
  if (name.startsWith('send_')) {
    return 'send';
  }
  if (name.startsWith('filter_')) {
    return 'filter';
  }
  if (name.startsWith('get_')) {
    return 'ordered-list';
  }
  if (name.startsWith('share_')) {
    return 'share-alt';
  }
  if (name.startsWith('transfer_')) {
    return 'swap';
  }
  if (name.startsWith('save_')) {
    return 'save';
  }
  if (name.startsWith('upload_')) {
    return 'upload';
  }
  if (name.startsWith('sync_')) {
    return 'sync';
  }
  if (name.startsWith('export_')) {
    return 'export';
  }
  return 'api';
}

export function TransformApiMethodGroups(
  methodGroups: IApiMethodGroup[],
  server: Servers
): IApiMethodGroup[] {
  return [...methodGroups]
    .filter((group) => {
      if (group.name === 'consultants' && group.methods.length < 5) {
        return false;
      }
      return true;
    })
    .map((methodGroup) => {
      const normalizedGroupName = NormalizeMethodGroupName(methodGroup.name);
      return {
        ...methodGroup,
        normalized: normalizedGroupName,
        server,
        methods: methodGroup.methods.map((method) => {
          const { methods, ...group } = methodGroup;
          return {
            id: methodGroup.name + '-' + method.name,
            name: method.name,
            auth: method.auth,
            server,
            normalized: NormalizeMethodName(method.name),
            icon: GetMethodIcon(method.name),
            group: {
              ...group,
              normalized: normalizedGroupName
            },
            params: method.params.map((param) => ({
              ...param,
              type: getParameterType(param),
              normalized: NormalizeMethodParamName(param.name)
            }))
          };
        })
      };
    });
}

export function getParameterType(param: IApiMethodParams) {
  // @ts-expect-error
  if (param.type === 'integer' && param.name.toLowerCase().endsWith('timestamp')) {
    return ['datetime'];
  } else {
    // @ts-expect-error
    return param.type?.split('|');
  }
}

export function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export function HttpHeaderToRecord(headers: HttpHeaders) {
  const headersMap: Record<string, string> = {};
  const headerKeys = headers.keys();
  for (const key of headerKeys) {
    headersMap[key] = headers.get(key);
  }
  return headersMap;
}

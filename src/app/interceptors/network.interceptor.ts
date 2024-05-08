import {
  HttpEventType,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { filter, tap } from 'rxjs';
import { LogActions } from '../state/actions';
import { ILog } from '../state/interfaces';
import { INTERNAL_REQUEST } from '../utilities';

function formDataToJson(formData: FormData) {
  const data: any = {};
  // @ts-expect-error FormData has entries()
  for (const pair of formData.entries()) {
    data[pair[0]] = pair[1];
  }
  return data;
}

function getHeadersSize(headers: HttpHeaders) {
  let size = 0;
  headers.keys().forEach((key) => {
    size += headers.get(key).length;
  });
  return size;
}

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const internalRequest = req.context.get(INTERNAL_REQUEST);
    if (internalRequest) {
      return next.handle(req);
    } else {
      const startTime = performance.now();
      // send cloned request with header to the next handler.
      return next.handle(req).pipe(
        filter((event) => event.type === HttpEventType.Response),
        tap((response: HttpResponse<any>) => {
          this.addLog(req, response, startTime);
        })
      );
    }
  }

  addLog(req: HttpRequest<any>, response: HttpResponse<any>, startTime: number) {
    let contentBytes = 0;
    let headerBytes = 0;
    if (response.headers.get('content-length')) {
      contentBytes = parseInt(response.headers.get('content-length'), 10);
      headerBytes = getHeadersSize(response.headers);
    }
    let apiEntity = null;
    let apiAction = null;
    if (req.body instanceof FormData) {
      const data = formDataToJson(req.body);
      apiEntity = data.entity;
      apiAction = data.method;
    }
    this.store.dispatch(
      new LogActions.Add({
        datetime: Date.now(),
        statusCode: response.status,
        method: req.method as ILog['method'],
        url: req.url,
        responseTime: Math.trunc(performance.now() - startTime),
        responseSize: Math.trunc(contentBytes + headerBytes),
        entity: apiEntity,
        action: apiAction,
        response
      })
    );
  }
}

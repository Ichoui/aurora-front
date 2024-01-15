import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { envBase } from '../environments/keep';

@Injectable({
  providedIn: 'root',
})
export class HttpsInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: envBase.auroraHeaders,
    });
    return next.handle(req);
  }
}

import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, timer, throwError, retry } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpsInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: environment.auroraHeaders,
    });

    return next.handle(req).pipe(
      retry({
        count: 5,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Retry on network timeout/CORS (0) or 5xx server errors due to cold start
          if (error.status === 0 || error.status >= 500) {
            // Exponential backoff: 1.5s, 3s, 6s...
            const delayMs = Math.pow(2, retryCount - 1) * 1500;
            console.warn(
              `[Firebase Cold Start] Retrying request ${req.url} (Attempt ${retryCount}/5) in ${delayMs}ms due to status ${error.status}...`,
            );
            return timer(delayMs);
          }
          // For other errors (e.g. 400, 401), we throw immediately without retrying
          return throwError(() => error);
        },
      }),
    );
  }
}

import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';
import { environment } from '../environments/environment';

export const httpsInterceptor: HttpInterceptorFn = (req, next) => {
  const request = req.clone({ setHeaders: environment.auroraHeaders });
  return next(request).pipe(
    retry({
      count: 5,
      delay: (error: unknown, retryCount: number) => {
        if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
          const delayMs = 2 ** (retryCount - 1) * 1500;
          console.warn(`Retrying request ${req.url} (${retryCount}/5) in ${delayMs}ms, status ${error.status}`);
          return timer(delayMs);
        }
        return throwError(() => error);
      },
    }),
  );
};

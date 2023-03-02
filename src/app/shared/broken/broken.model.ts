import { HttpErrorResponse } from '@angular/common/http';

export class ErrorTemplate {
  value: boolean;
  message: string;
  status: number;
  error: HttpErrorResponse;

  constructor(res: ErrorTemplate) {
    if (res) {
      this.value = res?.value ?? false;
      this.message = res?.message ?? 'Error, sorry for that...';
      this.status = res?.status ?? 0;
      this.error = new HttpErrorResponse(res?.error);
    }
  }
}

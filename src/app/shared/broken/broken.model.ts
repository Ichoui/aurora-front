import { HttpErrorResponse } from '@angular/common/http';

export class ErrorTemplate {
  value: boolean;
  message: string;
  status: number;
  error: HttpErrorResponse;

  constructor(res: ErrorTemplate) {
    if (res) {
      this.value = res.value;
      this.message = res.message;
      this.status = res.status;
      this.error = res.error;
    } else {
      this.value = false;
      this.status = 0;
      this.message = 'Error';
      this.error = new HttpErrorResponse({});
    }
  }
}

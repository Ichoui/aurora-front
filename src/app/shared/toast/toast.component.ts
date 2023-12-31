import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface ToastError {
  message: string;
  status: number;
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnChanges {
  @Input() toastError: ToastError;
  isToastOpen = false;

  toastButtons = [
    {
      text: '✔️ OK',
      role: 'cancel',
    },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.toastError.currentValue) {
      this.setOpen(true);
    }
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}

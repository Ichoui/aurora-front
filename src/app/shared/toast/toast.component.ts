import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export interface ToastError {
  message: string;
  status: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IonicModule],
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

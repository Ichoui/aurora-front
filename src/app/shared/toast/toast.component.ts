import type { OnChanges, SimpleChanges } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IonToast } from '@ionic/angular';

export interface ToastError {
  message: string;
  status: number | string;
}

@Component({
  selector: 'app-toast',
  imports: [IonToast],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnChanges {
  readonly toastError = input<ToastError | null>(null);
  readonly isToastOpen = signal(false);
  readonly message = computed(() => {
    const error = this.toastError();
    return error ? `${error.status}${error.message}` : '';
  });

  toastButtons = [
    {
      text: '✔️ OK',
      role: 'cancel',
    },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toastError']?.currentValue) {
      this.setOpen(true);
    }
  }

  setOpen(isOpen: boolean): void {
    this.isToastOpen.set(isOpen);
  }
}

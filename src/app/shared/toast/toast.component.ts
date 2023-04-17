import { Component, Input } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-toast',
  templateUrl: './broken.component.html',
  styleUrls: ['./broken.component.scss'],
})
export class ToastComponent {
  @Input() dataError;
}

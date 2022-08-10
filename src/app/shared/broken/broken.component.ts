import { Component, Input } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-broken',
  templateUrl: './broken.component.html',
  styleUrls: ['./broken.component.scss'],
})
export class BrokenComponent {
  @Input() dataError;
  lottieConfig: AnimationOptions = {
    path: `assets/lotties/lottie-broken.json`,
    renderer: 'svg',
    autoplay: true,
    loop: true,
  };
}

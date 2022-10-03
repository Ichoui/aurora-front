import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapsComponent } from './maps.component';
import { ModalModule } from '../../shared/modal/modal.module';
import { TranslateModule } from '@ngx-translate/core';
import { LottieAnimationViewModule } from 'ng-lottie';

@NgModule({
  declarations: [MapsComponent],
  imports: [CommonModule, ModalModule, TranslateModule, LottieAnimationViewModule.forRoot()],
  exports: [MapsComponent],
})
export class MapsModule {}

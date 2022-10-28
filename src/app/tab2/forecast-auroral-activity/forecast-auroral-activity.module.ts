import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastAuroralActivityComponent } from './forecast-auroral-activity.component';
import { ModalModule } from '../../shared/modal/modal.module';
import { TranslateModule } from '@ngx-translate/core';
import { LottieAnimationViewModule } from 'ng-lottie';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@NgModule({
  declarations: [ForecastAuroralActivityComponent],
  imports: [CommonModule, ModalModule, TranslateModule, LottieAnimationViewModule.forRoot(), IonicModule, RouterModule],
  exports: [ForecastAuroralActivityComponent],
  providers: [Geolocation],
})
export class ForecastAuroralActivityModule {}

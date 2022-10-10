import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuroraDataForecastComponent } from './aurora-data-forecast.component';
import { ModalModule } from '../../shared/modal/modal.module';
import { TranslateModule } from '@ngx-translate/core';
import { LottieAnimationViewModule } from 'ng-lottie';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@NgModule({
  declarations: [AuroraDataForecastComponent],
  imports: [CommonModule, ModalModule, TranslateModule, LottieAnimationViewModule.forRoot(), IonicModule, RouterModule],
  exports: [AuroraDataForecastComponent],
  providers: [Geolocation],
})
export class AuroraDataForecastModule {}

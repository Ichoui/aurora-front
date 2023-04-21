import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { HeaderPageModule } from '../shared/header/header.module';
import { TranslateModule } from '@ngx-translate/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SwiperModule } from 'swiper/angular';
import { InstantAuroralActivityModule } from './instant-auroral-activity/instant-auroral-activity.module';
import { ForecastAuroralActivityModule } from './forecast-auroral-activity/forecast-auroral-activity.module';
import { ToastModule } from '../shared/toast/toast.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule.forChild([{ path: '', component: Tab2Page }]),
    HeaderPageModule,
    InstantAuroralActivityModule,
    ForecastAuroralActivityModule,
    SwiperModule,
    ToastModule,
  ],
  declarations: [Tab2Page],
  providers: [Geolocation],
})
export class Tab2PageModule {}

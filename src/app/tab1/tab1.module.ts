import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { HeaderPageModule } from '../shared/header/header.module';
import { TranslateModule } from '@ngx-translate/core';
import { MeteoModule } from './meteo/meteo.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BrokenPageModule } from '../shared/broken/broken.module';
import { ToastModule } from '../shared/toast/toast.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }]),
    HeaderPageModule,
    MeteoModule,
    BrokenPageModule,
    ToastModule,
  ],
  declarations: [Tab1Page],
  providers: [Geolocation],
})
export class Tab1PageModule {}

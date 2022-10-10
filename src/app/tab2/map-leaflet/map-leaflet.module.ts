import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MapLeafletPage } from './map-leaflet.page';
import { TranslateModule } from '@ngx-translate/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HeaderPageModule } from '../../shared/header/header.module';

const routes: Routes = [
  {
    path: '',
    component: MapLeafletPage,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, HeaderPageModule],
  declarations: [MapLeafletPage],
  providers: [Geolocation],
})
export class LocationMapPageModule {}

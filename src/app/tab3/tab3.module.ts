import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab3Page } from './tab3.page';
import { LocationMapPageModule } from './location-map/location-map.module';
import { SettingsPageModule } from './settings/settings.module';

@NgModule({
  imports: [IonicModule, CommonModule, LocationMapPageModule, SettingsPageModule, RouterModule],
  declarations: [Tab3Page],
})
export class Tab3PageModule {}

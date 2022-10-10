import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab3Page } from './tab3.page';
import { SettingsPageModule } from './settings/settings.module';

@NgModule({
  imports: [IonicModule, CommonModule, SettingsPageModule, RouterModule],
  declarations: [Tab3Page],
})
export class Tab3PageModule {}

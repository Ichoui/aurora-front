import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { PlaceholderChartsComponent } from './placeholder-charts.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  exports: [PlaceholderChartsComponent],
  declarations: [PlaceholderChartsComponent],
})
export class PlaceholderChartsModule {}

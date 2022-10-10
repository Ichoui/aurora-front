import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstantForecastComponent } from './instant-forecast.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [InstantForecastComponent],
  exports: [InstantForecastComponent],
  imports: [CommonModule, TranslateModule, IonicModule],
})
export class InstantForecastModule {}

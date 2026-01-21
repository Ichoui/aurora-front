import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeteoComponent } from './meteo.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceholderChartsModule } from '../../shared/placeholders/placeholder-charts/placeholder-charts.module';
import { PlaceholderDataModule } from '../../shared/placeholders/placeholder-data/placeholder-data.module';
import { CalculateWindDegPipe } from './calculate-wind-deg.pipe';
import { CalculateUvPipe } from './calculate-uv.pipe';

@NgModule({
  declarations: [MeteoComponent, CalculateWindDegPipe, CalculateUvPipe],
  exports: [MeteoComponent],
  imports: [CommonModule, IonicModule, TranslateModule, PlaceholderChartsModule, PlaceholderDataModule],
})
export class MeteoModule {}

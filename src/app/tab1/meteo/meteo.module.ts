import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeteoComponent } from './meteo.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import player from 'lottie-web';
import { LottieModule } from 'ngx-lottie';
import { PlaceholderChartsModule } from '../../shared/placeholders/placeholder-charts/placeholder-charts.module';
import { PlaceholderDataModule } from '../../shared/placeholders/placeholder-data/placeholder-data.module';
import { CalculateWindDegPipe } from './calculate-wind-deg.pipe';
import { CalculateUvPipe } from './calculate-uv.pipe';

export const playerFactory = () => player;

@NgModule({
  declarations: [MeteoComponent, CalculateWindDegPipe, CalculateUvPipe],
  exports: [MeteoComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    LottieModule.forRoot({ player: playerFactory }),
    PlaceholderChartsModule,
    PlaceholderDataModule,
  ],
})
export class MeteoModule {}

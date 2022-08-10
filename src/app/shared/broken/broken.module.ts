import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { BrokenComponent } from './broken.component';
import { LottieModule } from 'ngx-lottie';
import { playerFactory } from '../../tab1/meteo/meteo.module';

@NgModule({
  imports: [CommonModule, IonicModule, LottieModule.forRoot({ player: playerFactory })],
  exports: [BrokenComponent],
  declarations: [BrokenComponent],
})
export class BrokenPageModule {}

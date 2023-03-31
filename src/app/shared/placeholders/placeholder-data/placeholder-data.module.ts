import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { PlaceholderDataComponent } from './placeholder-data.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  exports: [PlaceholderDataComponent],
  declarations: [PlaceholderDataComponent],
})
export class PlaceholderDataModule {}

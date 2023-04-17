import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { ToastComponent } from './toast.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  exports: [ToastComponent],
  declarations: [ToastComponent],
})
export class ToastModule {}

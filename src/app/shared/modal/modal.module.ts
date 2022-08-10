import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
// import { PinchZoomModule } from 'ngx-pinch-zoom';

@NgModule({
  declarations: [ModalComponent],
  exports: [ModalComponent],
  imports: [IonicModule, CommonModule, TranslateModule], // PinchZoomModule
  entryComponents: [ModalComponent],
})
export class ModalModule {}

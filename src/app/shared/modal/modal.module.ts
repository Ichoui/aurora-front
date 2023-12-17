import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ModalComponent],
  exports: [ModalComponent],
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class ModalModule {}

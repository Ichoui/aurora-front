import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MomentHourPipe } from './moment-hour.pipe';
import { MomentDatePipe } from './moment-date.pipe';

@NgModule({
  declarations: [ModalComponent, MomentHourPipe, MomentDatePipe],
  exports: [ModalComponent],
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class ModalModule {}

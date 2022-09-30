import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpindexComponent } from './kpindex.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [KpindexComponent],
  exports: [KpindexComponent],
  imports: [CommonModule, TranslateModule, IonicModule],
})
export class KpindexModule {
}

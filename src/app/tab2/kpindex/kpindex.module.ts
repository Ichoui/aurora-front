import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpindexComponent } from './kpindex.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    KpindexComponent
  ],
  exports: [
    KpindexComponent
  ],
    imports: [
        CommonModule,
        TranslateModule
    ]
})
export class KpindexModule { }

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Tab2Page } from './tab2.page';

@NgModule({
  imports: [Tab2Page, RouterModule.forChild([{ path: '', component: Tab2Page }])],
})
export class Tab2PageModule {}

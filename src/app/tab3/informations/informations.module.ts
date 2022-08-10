import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InformationsPage } from './informations.page';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderPageModule } from '../../shared/header/header.module';

const routes: Routes = [
  {
    path: '',
    component: InformationsPage,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule, RouterModule.forChild(routes), HeaderPageModule],
  declarations: [InformationsPage],
})
export class InformationsPageModule {}

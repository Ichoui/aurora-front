import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstantAuroralActivityComponent } from './instant-auroral-activity.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { AceToEarthPipe } from './ace-to-earth.pipe';
import { PlaceholderDataModule } from '../../shared/placeholders/placeholder-data/placeholder-data.module';

@NgModule({
  declarations: [InstantAuroralActivityComponent, AceToEarthPipe],
  exports: [InstantAuroralActivityComponent],
  imports: [CommonModule, TranslateModule, IonicModule, PlaceholderDataModule],
})
export class InstantAuroralActivityModule {}

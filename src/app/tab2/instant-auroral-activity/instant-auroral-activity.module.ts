import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstantAuroralActivityComponent } from './instant-auroral-activity.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { PlaceholderDataModule } from '../../shared/placeholders/placeholder-data/placeholder-data.module';
import { ForecastLeadTimePipe } from './forecast-lead-time';

@NgModule({
  declarations: [InstantAuroralActivityComponent, ForecastLeadTimePipe],
  exports: [InstantAuroralActivityComponent],
  imports: [CommonModule, TranslateModule, IonicModule, PlaceholderDataModule],
  providers: [ForecastLeadTimePipe],
})
export class InstantAuroralActivityModule {}

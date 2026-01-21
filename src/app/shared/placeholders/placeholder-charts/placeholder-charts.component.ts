import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-placeholder-charts',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './placeholder-charts.component.html',
  styleUrls: ['./placeholder-charts.component.scss'],
})
export class PlaceholderChartsComponent {
  @HostBinding('style.height') @Input() canvHeight?: number | null;
  @HostBinding('class.no-canvas') @Input() height?: boolean;
}

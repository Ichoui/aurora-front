import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-placeholder-charts',
  templateUrl: './placeholder-charts.component.html',
  styleUrls: ['./placeholder-charts.component.scss'],
})
export class PlaceholderChartsComponent {
  @HostBinding('style.height') @Input() canvHeight?: number | null;
  @HostBinding('class.no-canvas') @Input() height?: boolean;
}

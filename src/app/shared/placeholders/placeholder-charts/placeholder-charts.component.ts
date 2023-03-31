import { Component, HostBinding, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-placeholder-charts',
  templateUrl: './placeholder-charts.component.html',
  styleUrls: ['./placeholder-charts.component.scss'],
})
export class PlaceholderChartsComponent {
  @Input() placeholderVertical: boolean;
  @Input() placeholderHorizontal: boolean;
  @Input() index: number;

  @HostBinding('style.height') @Input() canvHeight: number;

  constructor(private _sanitizer: DomSanitizer) {}
}

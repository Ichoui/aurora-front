import {Component, HostBinding, Input, OnInit} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-placeholder-charts',
  templateUrl: './placeholder-charts.component.html',
  styleUrls: ['./placeholder-charts.component.scss'],
})
export class PlaceholderChartsComponent implements OnInit{
  @Input() placeholderVertical: boolean;
  @Input() placeholderHorizontal: boolean;

  @HostBinding('style.height') @Input() canvHeight?: number | null;
  @HostBinding('class.no-canvas') @Input() height?: boolean;

  constructor(private _sanitizer: DomSanitizer) {}

  ngOnInit(): void {
  }
}

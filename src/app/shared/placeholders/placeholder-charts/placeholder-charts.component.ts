import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-placeholder-charts',
  imports: [],
  templateUrl: './placeholder-charts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.height]': 'canvHeight()', '[class.no-canvas]': 'height()' },
  styleUrl: './placeholder-charts.component.scss',
})
export class PlaceholderChartsComponent {
  readonly canvHeight = input<string | null | undefined>(null);
  readonly height = input(false);
}

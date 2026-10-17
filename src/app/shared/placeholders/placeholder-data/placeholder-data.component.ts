import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-placeholder-data',
  imports: [],
  templateUrl: './placeholder-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './placeholder-data.component.scss',
})
export class PlaceholderDataComponent {
  readonly placeholderNumber = input(false);
  readonly placeholderAce = input(false);
  readonly index = input(2.5);
}

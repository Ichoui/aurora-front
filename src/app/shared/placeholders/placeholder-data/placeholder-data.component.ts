import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-placeholder-data',
  templateUrl: './placeholder-data.component.html',
  styleUrls: ['./placeholder-data.component.scss'],
})
export class PlaceholderDataComponent {
  @Input() placeholderNumber: boolean;
  @Input() placeholderAce: boolean;
  @Input() index: number
}

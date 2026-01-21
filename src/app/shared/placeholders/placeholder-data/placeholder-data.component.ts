import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-placeholder-data',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './placeholder-data.component.html',
  styleUrls: ['./placeholder-data.component.scss'],
})
export class PlaceholderDataComponent {
  @Input() placeholderNumber: boolean;
  @Input() placeholderAce: boolean;
  @Input() index: number;
}

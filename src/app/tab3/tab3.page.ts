import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrl: 'tab3.page.scss',

  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet],
})
export class Tab3Page {}

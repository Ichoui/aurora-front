import { Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [NgOptimizedImage, IonToolbar, IonHeader],
})
export class HeaderComponent {
  @Input() titre: string;
}

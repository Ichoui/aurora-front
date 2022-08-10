import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-informations',
  templateUrl: './informations.page.html',
  styleUrls: ['./informations.page.scss'],
})


export class InformationsPage {
  text;
  tabOpen = [];

  constructor(private translateService: TranslateService) {
  }

  visibility(event, index): void {
    if (this.tabOpen.includes(index)) {
      const remove = this.tabOpen.indexOf(index);
      this.tabOpen.splice(remove);
      event.target.nextElementSibling.style.display = 'none';
    } else {
      this.tabOpen.push(index);
      event.target.nextElementSibling.style.display = 'block';
    }
  }
}

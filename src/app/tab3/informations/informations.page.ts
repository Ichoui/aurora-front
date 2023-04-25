import { Component } from '@angular/core';

@Component({
  selector: 'app-informations',
  templateUrl: './informations.page.html',
  styleUrls: ['./informations.page.scss'],
})
export class InformationsPage {
  text;
  tabOpen = [0];

  visibility(event, index, title = false): void {
    const siblingElement = title ? event.target?.nextElementSibling : event.target.offsetParent.nextElementSibling;

    if (!siblingElement) {
      return;
    }
    if (this.tabOpen.includes(index)) {
      const remove = this.tabOpen.indexOf(index);
      this.tabOpen.splice(remove);
      siblingElement.style.display = 'none';
    } else {
      this.tabOpen.push(index);
      siblingElement.style.display = 'block';
    }
  }
}

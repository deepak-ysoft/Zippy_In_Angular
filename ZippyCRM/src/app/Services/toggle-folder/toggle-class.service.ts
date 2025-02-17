import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToggleClassService {
  constructor() {}
  private className: string = 'toggle-sidebar'; 
  private isClassAdded: boolean = false;

  toggleClass(): void {
    if (this.isClassAdded) {
      document.body.classList.remove(this.className);
    } else {
      document.body.classList.add(this.className);
    }
    this.isClassAdded = !this.isClassAdded;
  }
}

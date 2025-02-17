import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ContactUs } from '../../../Models/contactUs.model';
import { UserLocalStorageService } from '../../../Services/userLocalStorage.service';

declare var bootstrap: any;
@Component({
  selector: 'app-show-notification-popup',
  standalone: true,
  imports: [],
  templateUrl: './show-notification-popup.component.html',
  styleUrl: './show-notification-popup.component.css',
})
export class ShowNotificationPopupComponent implements OnInit {
  contactUs!: ContactUs;
  loggedUser: any;
  userLocalStorageService = inject(UserLocalStorageService);

  ngOnInit(): void {
    const state = window.history.state as { contactUs: ContactUs };
    if (state && state.contactUs) {
      this.contactUs = state.contactUs;
    }
    this.userLocalStorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
  }
}

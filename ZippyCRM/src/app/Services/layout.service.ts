import { inject, Injectable } from '@angular/core';
import { ContactUsService } from './contactUsService/contact-us.service';
import { ContactUs } from '../Models/contactUs.model';
import { UserLocalStorageService } from './userLocalStorage.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  service = inject(ContactUsService);
  loggedUser: any;
  userLocalStorageService = inject(UserLocalStorageService);
  notificationCount = 0;
  contactUsList: ContactUs[] = [];
  /**
   *
   */
  constructor() {
    this.userLocalStorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
  }
  GetContactUsData() {
    if (this.loggedUser?.user?.userId) {
      this.service
        .getContactUsList(this.loggedUser?.user?.userId)
        .subscribe((res: any) => {
          if (res.success) {
            this.contactUsList = [...res.res.result]
              .filter((item) => item.isMarked !== true)
              .sort((a, b) => b.id - a.id);
            this.notificationCount = this.contactUsList.length;
            this.service.updateContactList(
              this.contactUsList,
              this.notificationCount
            ); // Update the shared service
          } else {
          }
        });
    }
  }
}

import {
  Component,
  inject,
  NgZone,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToggleClassService } from '../../Services/toggle-folder/toggle-class.service';
import { Customer } from '../../Models/customer.model';
import { CommonModule } from '@angular/common';
import { ContactUsService } from '../../Services/contactUsService/contact-us.service';
import { ContactUs } from '../../Models/contactUs.model';
import { UserLocalStorageService } from '../../Services/userLocalStorage.service';
import { UsersService } from '../../Services/customerService/users.service';
import { LayoutService } from '../../Services/layout.service';
import { ShowNotificationPopupComponent } from '../ContactUs/show-notification-popup/show-notification-popup.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {
  loggedUser: any; // Change to the appropriate type based on your data structure
  router = inject(Router);
  contactUsService = inject(ContactUsService);
  contactUs!: ContactUs;
  contactUsList: ContactUs[] = [];
  showAllnotification = false;
  notificationCount = 0;
  layoutService = inject(LayoutService);
  private intervalId: any;

  @ViewChild('popupContainer', { read: ViewContainerRef, static: true })
  popupContainer!: ViewContainerRef;

  constructor(
    private ngZone: NgZone,
    private service: UsersService,
    private toggleClassService: ToggleClassService,
    private userLocalstorageService: UserLocalStorageService
  ) {
    this.loadUserData();
    this.contactUsService.contactList$.subscribe((list) => {
      this.contactUsList = list;
    });

    this.contactUsService.contactCount$.subscribe((count) => {
      this.notificationCount = count;
    });
    this.layoutService.GetContactUsData();
  }

  ngOnInit(): void {
    // this.ngZone.runOutsideAngular(() => {
    //   this.intervalId = setInterval(() => {
    //     this.ngZone.run(() => {
    //       this.layoutService.GetContactUsData();
    //     });
    //   }, 60000);
    // });
  }

  // on clicking three dot of web site sdfsdfsdf
  onToggleClass(): void {
    this.toggleClassService.toggleClass();
  }

  loadUserData(): void {
    this.userLocalstorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
  }

  ngOnDestroy(): void {
    // Clear the interval to prevent memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  showNotification(contactUs: ContactUs) {
    debugger;
    this.router.navigate(['contact-us-details'], {
      state: { contactUs: this.contactUs },
    });
  }

  readMessage(contactUs: ContactUs) {
    debugger;
    this.showAllnotification = true;
    this.contactUs = contactUs;
    this.showNotification(this.contactUs);
    this.contactUsService
      .updateContactUs(contactUs.id)
      .subscribe((res: any) => {
        if (res) {
          this.layoutService.GetContactUsData();
        }
      });
  }

  // On sign out the user
  signOut() {
    localStorage.clear();
    this.router.navigate(['login']);
  }

  getTimeDifference(inputTime: Date | undefined): string {
    if (!inputTime) {
      return 'No time provided'; // Handle undefined case
    }

    const inputDate = new Date(inputTime); // Convert to Date object
    const currentDate = new Date(); // Get the current time

    const timeDiff = currentDate.getTime() - inputDate.getTime(); // Difference in milliseconds

    // Convert the difference to a readable format
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day(s) ago`;
    } else if (hours > 0) {
      return `${hours} hour(s) ago`;
    } else if (minutes > 0) {
      return `${minutes} minute(s) ago`;
    } else {
      return `${seconds} second(s) ago`;
    }
  }
}

import { Component, inject } from '@angular/core';
import { ContactUs } from '../../../Models/contactUs.model';
import { ContactUsService } from '../../../Services/contactUsService/contact-us.service';
import { UserLocalStorageService } from '../../../Services/userLocalStorage.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact-us-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact-us-list.component.html',
  styleUrl: './contact-us-list.component.css',
})
export class ContactUsListComponent {
  contactUsList: ContactUs[] = [];
  loggedUser: any;
  currentPage = 1;
  pageSize = 10; // Number of customers per page
  totalMessage = 0; // Total number of customers from the API
  totalPages = 0;
  searchTerm = ''; // For search input
  router = inject(Router);
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private contactUsService: ContactUsService,
    private userLocalStorageService: UserLocalStorageService
  ) {
    this.userLocalStorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (page < 1) {
      return; // Prevent out of range pages
    }
    this.currentPage = page;

    const params = {
      id: this.loggedUser.user.userId,
      page: this.currentPage.toString(),
      pageSize: this.pageSize.toString(),
      searchTerm: this.searchTerm,
    }; // Get customer parameter

    this.http
      .get<any>(
        `${this.baseUrl}api/Home/GetContactUsList/${this.loggedUser.user.userId}`,
        { params }
      )
      .subscribe((response: any) => {
        this.contactUsList = response.data;
        this.totalMessage = response.totalCount;
        this.totalPages = Math.ceil(this.totalMessage / this.pageSize);
      });
  }

  // Get customer list loaded page and display
  getDisplayedPages(): number[] {
    const pages = [];

    if (this.totalPages <= 3) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } else {
        pages.push(
          this.currentPage - 1,
          this.currentPage,
          this.currentPage + 1
        );
      }
    }

    return pages;
  }
  notificationDetails(contactUs: ContactUs) {
    debugger;
    this.router.navigate(['contact-us-details'], {
      state: { contactUs: contactUs },
    });
  }

  deleteNotification(id: number) {
    this.contactUsService.deletenotification(id).subscribe((res: any) => {
      if (res) {
        this.loadPage(1);
      } else {
      }
    });
  }
  getAllNotifications(userId: number) {
    this.contactUsService.getContactUsList(userId).subscribe((res: any) => {
      if (res) {
        this.contactUsList = res;
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Somthing is wrong!',
          icon: 'error',
          timer: 2000, // Auto close after 2000 milliseconds
          showConfirmButton: false,
        });
      }
    });
  }
}

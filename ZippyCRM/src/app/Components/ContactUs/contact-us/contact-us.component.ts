import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContactUs } from '../../../Models/contactUs.model';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContactUsService } from '../../../Services/contactUsService/contact-us.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { UserLocalStorageService } from '../../../Services/userLocalStorage.service';
import { UsersService } from '../../../Services/customerService/users.service';
import { LayoutService } from '../../../Services/layout.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements OnInit {
  contactUs: ContactUs;
  service = inject(ContactUsService);
  loginService = inject(UsersService);
  router = inject(Router);
  submitted = false;
  loggedUser: any;
  userLocalStorageService = inject(UserLocalStorageService);
  submittedsuccess = false;
  layoutService = inject(LayoutService);
  dsdsds = '';

  constructor() {
    this.contactUs = new ContactUs();
  }
  ngOnInit(): void {
    this.userLocalStorageService.user$.subscribe((user) => {
      if (user != null && user != undefined) {
        this.loggedUser = user;
      }
    });

    this.layoutService.GetContactUsData();
    // to update notifications after login
    this.loginService.getEventSubject().subscribe(() => {
      this.layoutService.GetContactUsData(); // Call the function after login
    });
  }

  onSubmitForm: FormGroup = new FormGroup({
    id: new FormControl(),
    userId: new FormControl(),
    isMarked: new FormControl(),
    sendTime: new FormControl(),
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-z\s]+(?: [A-Za-z0-9\s]+)*$/),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
      ),
    ]),
    subject: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loggedUser == null || this.loggedUser == undefined) {
      this.onSubmitForm.get('userId')?.setValue(17);
    } else {
      this.onSubmitForm.get('userId')?.setValue(this.loggedUser.user.userId);
    }
    debugger;
    this.submitted = true;
    this.onSubmitForm.get('id')?.setValue(0);
    this.onSubmitForm.get('isMarked')?.setValue(false);

    const currentDate = new Date();
    this.onSubmitForm.get('sendTime')?.setValue(currentDate);
    if (this.onSubmitForm.valid) {
      this.service.contactUs(this.onSubmitForm.value).subscribe({
        next: (res: any) => {
          if (res) {
            this.onSubmitForm.reset();
            this.submitted = false;
            this.submittedsuccess = true;

            // After 5 seconds, reset it back to false
            setTimeout(() => {
              this.submittedsuccess = false;
            }, 5000); // 5 seconds
            this.submittedsuccess = true;
            this.layoutService.GetContactUsData();
          } else {
            Swal.fire({
              title: 'error!',
              text: 'Somthing is wrong!',
              icon: 'error',
              timer: 2000, // Auto close after 2 seconds
              showConfirmButton: false,
            });
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.onSubmitForm.get(
                field.charAt(0).toLowerCase() + field.slice(1)
              );
              if (formControl) {
                formControl.setErrors({
                  serverError: validationErrors[field].join(' '),
                });
              }
            }
          }
        },
      });
    }
  }

  // if feild is invalid then show error
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }
}

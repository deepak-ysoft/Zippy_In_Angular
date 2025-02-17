import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../Services/customerService/users.service';
import { CustomerServiceService } from '../../../Services/customerService/customer-service.service';
import Swal from 'sweetalert2';
import { Jobes } from '../../../Models/Jobs';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { delay } from 'rxjs';
import { UserLocalStorageService } from '../../../Services/userLocalStorage.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  loggedUser: any; // Change to the appropriate type based on your data structure
  selectedFile: File | null = null; // Stores the file object
  imagePreview: string | null = null; // Stores the image preview URL
  cusService = inject(CustomerServiceService);
  http = inject(HttpClient);
  router = inject(Router);
  jobs: Jobes[] = [];
  jobsOptions: Array<{ value: number; text: string }> = [];
  passwordForm: FormGroup;
  onSubmitForm: FormGroup;
  submitted = false;
  private baseUrl = environment.apiUrl

  constructor(
    private service: UsersService,
    private fb: FormBuilder,
    private userLocalstorageService: UserLocalStorageService
  ) {
    this.loadUserData();

    // Edit user form validation
    this.onSubmitForm = this.fb.group({
      discription: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          phoneValueRangeValidator(1000000000, 999999999999),
        ],
      ],
      company: ['', Validators.required],
      jobId: ['', Validators.required],
      country: ['', Validators.required],
      address: ['', Validators.required],
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s]+(?: [A-Za-z0-9\s]+)*$/),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      photo: [null],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ), // At least one uppercase, one lowercase, one number, one special character, and minimum 8 characters
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validator: passwordMatchValidator() } // Apply the custom validator here
    );
  }
  // compare password validation
  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get('newPassword')?.value ===
      formGroup.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  ngOnInit(): void {
    this.service.getJobs().subscribe((res: any) => {
      this.jobs = res;
      this.jobsOptions = this.jobs.map((job) => ({
        value: job.jobId,
        text: job.jobName,
      }));
      // Fill user value in fields on page load
      this.onSubmitForm.patchValue({
        username: this.loggedUser.user.username,
        email: this.loggedUser.user.email,
        company: this.loggedUser.user.company,
        jobId: this.loggedUser.user.jobId,
        phone: this.loggedUser.user.phone,
        country: this.loggedUser.user.country,
        photo: [null], // Reset photo control
        address: this.loggedUser.user.address,
        discription: this.loggedUser.user.discription,
      });
    });
  }

  loadUserData(): void {
    this.userLocalstorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
  }

  // if user select image for profile
  // Handle file selection and generate image preview
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();

      // Read the file as a data URL (base64 string)
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Set the image preview URL
      };
    }
  }
  onSubmit() {
    this.submitted = true;
    // if form data is valid
    if (!this.onSubmitForm.invalid) {
      const formData = new FormData();
      // Append other user information from form controls
      if (this.loggedUser.user.userId) {
        formData.append('userId', this.loggedUser.user.userId.toString());
      }
      formData.append(
        'username',
        this.onSubmitForm.get('username')?.value || ''
      );
      formData.append('company', this.onSubmitForm.get('company')?.value || '');
      formData.append('country', this.onSubmitForm.get('country')?.value || '');
      formData.append('address', this.onSubmitForm.get('address')?.value || '');
      formData.append('phone', this.onSubmitForm.get('phone')?.value || '');
      formData.append(
        'discription',
        this.onSubmitForm.get('discription')?.value || ''
      );
      formData.append('jobId', this.onSubmitForm.get('jobId')?.value || '');
      formData.append('email', this.onSubmitForm.get('email')?.value || '');
      formData.append('password', localStorage.getItem('loginPassword') || '');
      formData.append('cPassword', localStorage.getItem('loginPassword') || '');

      // Handle file upload if a new file is selected
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
        this.submitFormData(formData);
      } else {
        const baseUrl = `${this.baseUrl}uploads/images/users/`;
        let imagePath = '';
        imagePath = this.loggedUser.user.imagePath.replace(baseUrl, '');
        this.http
          .get(this.loggedUser.user.imagePath, { responseType: 'blob' })
          .subscribe({
            next: (blob) => {
              const file = new File([blob], imagePath, { type: blob.type });
              formData.append('photo', file);
              this.submitFormData(formData); // Submit the FormData with the image
            },
            error: (error) =>
              console.error('Error fetching existing image:', error),
          });
      }
    }
  }

  // Separate function to submit form data
  submitFormData(formData: FormData) {
    this.service.editUser(formData).subscribe({
      next: (res: any) => {
        // Show the SweetAlert notification
        if (res.success) {
          Swal.fire({
            title: 'Done!',
            text: 'User Updated',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.userLocalstorageService.clearUser();
            this.userLocalstorageService.setUser(res);
          });
        } else if (!res.success && res.message == 'Password Not Match') {
          Swal.fire({
            title: 'Error!',
            text: 'Wrong Password.',
            icon: 'error',
            timer: 1000,
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
  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }
  onPasswordSubmit() {
    // if change password is valid
    if (this.passwordForm.valid) {
      const formData = new FormData();

      // Append user information
      if (this.loggedUser.user.userId) {
        formData.append('userId', this.loggedUser.user.userId.toString());
      }
      // Append password fields
      formData.append(
        'currentPassword',
        this.passwordForm.get('currentPassword')?.value || ''
      );
      formData.append(
        'newPassword',
        this.passwordForm.get('newPassword')?.value || ''
      );
      formData.append(
        'newCPassword',
        this.passwordForm.get('confirmPassword')?.value || ''
      );

      // Call the service to change the password
      this.service.changeUserPassword(formData).subscribe((res: any) => {
        if (res) {
          Swal.fire({
            title: 'Done!',
            text: 'Password Changed successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
          // Reset the form fields after successful submission
          this.passwordForm.reset();
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to change the password. Please try again.',
            icon: 'error',
          });
        }
      });
    }
  }
}

// Password compare validation
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  };
}

// phone number validation
export function phoneValueRangeValidator(
  minValue: number,
  maxValue: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phoneValue = +control.value; // Convert to a number

    if (!control.value || isNaN(phoneValue)) {
      return null; // If the field is empty or not a number, return no error
    }

    if (phoneValue < minValue) {
      return { minPhoneValue: true };
    }

    if (phoneValue > maxValue) {
      return { maxPhoneValue: true };
    }

    return null; // If within range, no error
  };
}

import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Users } from '../../../Models/Users';
import { Jobes } from '../../../Models/Jobs';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UsersService } from '../../../Services/customerService/users.service';
import { UserLocalStorageService } from '../../../Services/userLocalStorage.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css',
})
export class UserRegisterComponent implements OnInit {
  user: Users;
  jobs: Jobes[] = [];
  jobsOptions: Array<{ value: number; text: string }> = [];
  service = inject(UsersService);
  router = inject(Router);
  selectedFile: any = null;
  onSubmitForm: FormGroup;
  loggedUser: any;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.user = new Users();
    this.loadUserData();
    
    // for user register validation
    this.onSubmitForm = this.fb.group(
      {
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
            Validators.pattern(
              /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
            ),
          ],
        ],
        photo: [null], // Add this line
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ), // At least one uppercase, one lowercase, one number, one special character, and minimum 8 characters
          ],
        ],
        cPassword: ['', Validators.required],
      },
      { validator: passwordMatchValidator() }
    ); // Apply the custom validator here
  }

  ngOnInit(): void {
    this.service.getJobs().subscribe((res: any) => {
      this.jobs = res;
      this.jobsOptions = this.jobs.map((job) => ({
        value: job.jobId,
        text: job.jobName,
      }));
    });
  }
  userLocalStorageService = inject(UserLocalStorageService);

  loadUserData(): void {
    this.userLocalStorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
  }

  // when user click on change password
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
    }
  }

  onSave() {
    this.submitted = true;
    // if form is not invalid
    if (!this.onSubmitForm.invalid) {
      const formData = new FormData();
      // Append other user information from form controls
      formData.append(
        'username',
        this.onSubmitForm.get('username')?.value || ''
      );
      formData.append('company', this.onSubmitForm.get('company')?.value || '');
      formData.append('country', this.onSubmitForm.get('country')?.value || '');
      formData.append('address', this.onSubmitForm.get('address')?.value || '');
      formData.append('phone', this.onSubmitForm.get('phone')?.value || '');
      if (this.selectedFile) {
        // Append the selected file
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      } else {
        // Create a File object for "Default.jpg"
        const defaultFile = new File([''], 'Default.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        formData.append('photo', defaultFile);
      }
      formData.append(
        'discription',
        this.onSubmitForm.get('discription')?.value || ''
      );
      formData.append('jobId', this.onSubmitForm.get('jobId')?.value || '');
      formData.append('email', this.onSubmitForm.get('email')?.value || '');
      formData.append(
        'password',
        this.onSubmitForm.get('password')?.value || ''
      );
      formData.append(
        'cPassword',
        this.onSubmitForm.get('cPassword')?.value || ''
      );
      const formDataObject: { [key: string]: any } = {};
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });

      this.service.insertUser(formData).subscribe({
        next: (res: any) => {
          // Check if the response indicates success or failure
          if (res.success) {
            Swal.fire({
              title: 'Done!',
              text: 'Register user successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
            this.router.navigateByUrl('login'); // Navigate to a login or dashboard page
          } else if (!res.success && res.exists == 'EmailExists') {
            // If the response is false or indicates failure (like email already exists)
            Swal.fire({
              title: 'Error!',
              text: 'Email is already exist.',
              icon: 'error',
              timer: 2000,
              showConfirmButton: false,
            });
          } else if (!res.success && res.exists == 'MobileNumberExists') {
            // If the response is false or indicates failure (like email already exists)
            Swal.fire({
              title: 'Error!',
              text: 'Mobile Number is already exist.',
              icon: 'error',
              timer: 2000,
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

  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }
}

// copmare password validation
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const cPassword = control.get('cPassword')?.value;

    return password === cPassword ? null : { mismatch: true };
  };
}

// Phone number validation
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

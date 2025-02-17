import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UsersService } from '../../../Services/customerService/users.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-reset-password.component.html',
  styleUrl: './user-reset-password.component.css',
})
export class UserResetPasswordComponent {
  userService = inject(UsersService);
  router = inject(Router);

  // reset form validation
  onSubmitForm: FormGroup = new FormGroup(
    {
      email: new FormControl(),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        ), // At least one uppercase, one lowercase, one number, one special character, and minimum 8 characters
      ]),
      newCPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  onSave() {
    this.onSubmitForm
      .get('email')
      ?.setValue(localStorage.getItem('userEmailForResetPassword'));
    if (this.onSubmitForm.valid) {
      this.userService
        .resetPassword(this.onSubmitForm.value)
        .subscribe((res: any) => {
          if (res) {
            this.router.navigateByUrl('login');
            localStorage.removeItem('userEmailForResetPassword');
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'User not found, Please try again to forgot password.',
              icon: 'error',
              timer: 2000, // Auto close after 2000 milliseconds
              showConfirmButton: false,
            });
          }
        });
    }
  }
}

// Password compare validation
export const passwordMatchValidator: ValidatorFn = (
  formGroup: AbstractControl
) => {
  const newPassword = formGroup.get('newPassword')?.value;
  const newCPassword = formGroup.get('newCPassword')?.value;

  return newPassword && newCPassword && newPassword === newCPassword
    ? null
    : { passwordMismatch: true };
};

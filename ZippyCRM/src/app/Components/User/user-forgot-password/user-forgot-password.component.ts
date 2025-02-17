import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../../Services/customerService/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-forgot-password',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './user-forgot-password.component.html',
  styleUrl: './user-forgot-password.component.css',
})
export class UserForgotPasswordComponent {
  emailSend = false;
  userService = inject(UsersService);

  // forgot form validation
  onSubmitForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
      ),
    ]),
  });

  // To send email into api
  onSend() {
    this.userService
      .forgotPassword(this.onSubmitForm.value)
      .subscribe((res: any) => {
        if (res) {
          const email = this.onSubmitForm.value;
          localStorage.setItem('userEmailForResetPassword', email.email);
          Swal.fire({
            title: 'Done!',
            text: 'Check your email account, we sent you a link to reset your password!',
            icon: 'success',
            timer: 5000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'User not found.',
            icon: 'error',
            timer: 2000, // Auto close after 2000 milliseconds
            showConfirmButton: false,
          });
        }
      });
  }
}

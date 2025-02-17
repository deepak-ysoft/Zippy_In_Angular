import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Customer,
  gender,
  language,
  title,
} from '../../../Models/customer.model';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CustomerServiceService } from '../../../Services/customerService/customer-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './customer-register.component.html',
  styleUrl: './customer-register.component.css',
})
export class CustomerRegisterComponent implements OnInit {
  customer: Customer = new Customer(); // Initialize customer with a default object
  message = 'Add Customer';
  selectedFile: any = null;
  titleOptions: Array<{ value: number; text: string }> = [];
  genderOptions: Array<{ value: number; text: string }> = [];
  languageOptions: Array<{ value: number; text: string }> = [];
  router = inject(Router);
  cusService = inject(CustomerServiceService);
  onSubmitForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    //For validation
    this.onSubmitForm = this.fb.group(
      {
        pan: [''],
        gst: [''],
        title: ['', Validators.required],
        firstName: [
          '',
          [Validators.required, Validators.pattern(/^[A-Za-z]*$/)],
        ],
        middleName: ['', [Validators.pattern(/^[A-Za-z\s]*$/)]],
        lastName: ['', Validators.required],
        gender: ['', Validators.required],
        position: ['', Validators.required],
        language: ['', Validators.required],
        dayOfBirth: ['', Validators.required],
        phone: [
          '',
          [
            Validators.required,
            phoneValueRangeValidator(1000000000, 999999999999),
          ],
        ],
        phoneOther: [
          '',
          [
            Validators.required,
            phoneValueRangeValidator(1000000000, 999999999999),
          ],
        ],
        cell: ['', Validators.required],
        fax: ['', Validators.required],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
            ),
          ],
        ],
        email2: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
            ),
          ],
        ],
        website: ['', Validators.required],
        comments: ['', Validators.required],
      },
      { validators: this.panOrGstValidator() }
    );
  }

  // Custom validator to check if either PAN or GST is filled
  private panOrGstValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      const pan = formGroup.get('pan')?.value;
      const gst = formGroup.get('gst')?.value;
      if (pan || gst) {
        return null; // Valid if either pan or gst has a value
      }

      return { panOrGstRequired: true }; // Invalid if both are empty
    };
  }

  ngOnInit(): void {
    // autometically load dropdown and fill value if user want to edit customer 
    this.titleOptions = this.convertEnumToArray(title);
    this.genderOptions = this.convertEnumToArray(gender);
    this.languageOptions = this.convertEnumToArray(language);
    const state = window.history.state;
    if (state && state.customer) {
      this.customer = state.customer;

      if (
        this.titleOptions.length &&
        this.genderOptions.length &&
        this.languageOptions.length
      ) {
        this.onSubmitForm.patchValue({
          cId: this.customer.cId,
          type: this.customer.type,
          pan: this.customer.pan,
          gst: this.customer.gst,
          title: this.customer.title,
          firstName: this.customer.firstName,
          middleName: this.customer.middleName,
          lastName: this.customer.lastName,
          position: this.customer.position,
          gender: this.customer.gender,
          dayOfBirth: this.customer.dayOfBirth,
          phone: this.customer.phone,
          phoneOther: this.customer.phoneOther,
          cell: this.customer.cell,
          fax: this.customer.fax,
          email: this.customer.email,
          email2: this.customer.email2,
          website: this.customer.website,
          language: this.customer.language,
          comments: this.customer.comments,
          photo: this.customer.photo,
        });
        this.onSubmitForm.get('title')?.setValue(this.customer.title);
        this.onSubmitForm.get('gender')?.setValue(this.customer.gender);
        this.onSubmitForm.get('language')?.setValue(this.customer.language);
        this.message = 'Edit Customer';
      }
    } else {
      this.customer = new Customer();
      this.message = 'Create New Customer';
    }

    if (this.customer.pan == null) {
      this.getAccountType('Commercial');
    } else {
      this.getAccountType('Individual');
    }
  }
  convertEnumToArray(enumObj: any): Array<{ value: number; text: string }> {
    return Object.keys(enumObj)
      .filter((key) => isNaN(Number(key))) // filters out numeric keys
      .map((key) => ({ value: enumObj[key], text: key })); // makes it an array of {value, text}
  }
// For GST and PAN 
  Individual: boolean = true;
  Commercial: boolean = false;
  getAccountType(type: any) {
    if (type == 'Commercial') {
      this.Individual = false;
      this.Commercial = true;
    } else {
      this.Commercial = false;
      this.Individual = true;
    }
  }
  // If user select any image for profile
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.onSubmitForm.invalid) {
      const formData = new FormData();

      if (this.customer?.cId) {
        formData.append('cId', this.customer?.cId.toString() || '');
      }
      this.customer.type = 1;
      formData.append('type', this.onSubmitForm.get('type')?.value || '1');
      formData.append('pan', this.onSubmitForm.get('pan')?.value || '');
      formData.append('gst', this.onSubmitForm.get('gst')?.value || '');
      formData.append('title', this.onSubmitForm.get('title')?.value || '');
      formData.append(
        'firstName',
        this.onSubmitForm.get('firstName')?.value || ''
      ); // Required field
      formData.append(
        'middleName',
        this.onSubmitForm.get('middleName')?.value || ''
      );
      formData.append(
        'lastName',
        this.onSubmitForm.get('lastName')?.value || ''
      ); // Required field
      formData.append(
        'position',
        this.onSubmitForm.get('position')?.value || ''
      );
      formData.append('gender', this.onSubmitForm.get('gender')?.value || '');
      formData.append(
        'dayOfBirth',
        this.onSubmitForm.get('dayOfBirth')?.value || ''
      );
      formData.append('phone', this.onSubmitForm.get('phone')?.value || '');
      formData.append(
        'phoneOther',
        this.onSubmitForm.get('phoneOther')?.value || ''
      );
      formData.append('cell', this.onSubmitForm.get('cell')?.value || '');
      formData.append('fax', this.onSubmitForm.get('fax')?.value || '');
      formData.append('email', this.onSubmitForm.get('email')?.value || ''); // Required field
      formData.append('email2', this.onSubmitForm.get('email2')?.value || '');
      formData.append('website', this.onSubmitForm.get('website')?.value || '');
      formData.append(
        'language',
        this.onSubmitForm.get('language')?.value || ''
      );
      formData.append(
        'comments',
        this.onSubmitForm.get('comments')?.value || ''
      );

      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }


      this.cusService.insertCustomer(formData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.router.navigateByUrl('customer-list');
          } else if (res.message == 'emai1') {
            Swal.fire({
              title: 'Error!',
              text: 'First email is already exist.',
              icon: 'error',
              timer: 2000, // Auto close after 2000 milliseconds
              showConfirmButton: false,
            });
          } else if (res.message == 'emai2') {
            Swal.fire({
              title: 'Error!',
              text: 'Second email is already exist.',
              icon: 'error',
              timer: 2000, // Auto close after 2000 milliseconds
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Somthing is wrong.',
              icon: 'error',
              timer: 2000, // Auto close after 2000 milliseconds
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

  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }
}
// For phone number maximum and minimum length
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

import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ContactService } from '../../../../Services/customerService/contact.service';
import { Contact } from '../../../../Models/cusContact.model';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerServiceService } from '../../../../Services/customerService/customer-service.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;
@Component({
  selector: 'app-cus-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cus-contact.component.html',
  styleUrl: './cus-contact.component.css',
})
export class CusContactComponent implements OnInit {
  service = inject(ContactService);
  cusService = inject(CustomerServiceService);
  router = inject(Router);
  ContectList: Contact[] = [];
  modalPopupAndMsg = 'Create Contact';
  isContacts: boolean = true;
  @Input() customerId!: any;
  @ViewChild('addContactModal', { static: false }) addContactModal!: ElementRef;
  contact: Contact;
  submitted = false;

  // For form validation
  onSubmitForm: FormGroup = new FormGroup({
    cId: new FormControl(),
    contactId: new FormControl(),
    contactName: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-z\s]+(?: [A-Za-z0-9\s]+)*$/),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
      ),
    ]),
    title: new FormControl('', [Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      phoneValueRangeValidator(1000000000, 999999999999),
      Validators.pattern('^[+]?[0-9 ]*$'),
    ]),
    jobPosition: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [
      Validators.required,
      phoneValueRangeValidator(1000000000, 999999999999),
      Validators.pattern(/^\+?[0-9]*$/),
    ]),
    internalNotes: new FormControl('', [Validators.required]),
  });

  constructor(private fb: FormBuilder) {
    this.contact = new Contact();
  }

  ngOnInit(): void {
    // Simulate fetching customer contact list by ID
    this.getContactList(this.customerId.toString());

    this.onSubmitForm.get('cId')?.setValue(this.customerId);
  }

  getContactList(id: any) {
    this.service.getContects(id).subscribe((res: any) => {
      this.ContectList = res;
    });
  }

  onAdd() {
    this.onSubmitForm.reset();
    this.onSubmitForm.reset({ title: '' });
    this.modalPopupAndMsg = 'Create Contact';
    this.submitted = false;
  }

  EditContact(contact: Contact) {
    //set contact value in form fields
    this.onSubmitForm.patchValue({
      cId: contact.cId,
      contactId: contact.contactId,
      contactName: contact.contactName,
      email: contact.email,
      title: contact.title,
      phone: contact.phone,
      mobile: contact.mobile,
      jobPosition: contact.jobPosition,
      internalNotes: contact.internalNotes,
    });
    this.modalPopupAndMsg = 'Edit Contact';
  }

  onSubmit() {
    this.submitted = true;
    if (this.onSubmitForm.get('contactId')?.value == null) {
      this.onSubmitForm.get('contactId')?.setValue(0);
    }
    this.onSubmitForm.get('cId')?.setValue(this.customerId);
    // submit if form is valid
    if (this.onSubmitForm.valid) {
      this.service.inserContact(this.onSubmitForm.value).subscribe({
        next: (res: any) => {
          if (res) {
            this.contact = new Contact();
            const modal = bootstrap.Modal.getInstance(
              this.addContactModal.nativeElement
            );
            modal.hide();
            this.getContactList(this.customerId);
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Not Added.',
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

  // Show server-side error if invalid
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }

  ContactDetails(contact: Contact) {
    this.contact = contact;
    this.modalPopupAndMsg = 'Contact Details';
  }

  DeleteContact(Id: number) {
    this.cusService.confirmDelete().then((result) => {
      if (result.isConfirmed) {
        this.service.successDelete(Id).subscribe(() => {
          this.getContactList(this.customerId);
        });
      }
    });
  }
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

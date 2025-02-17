import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CustomerNotes } from '../../../../Models/cusNotes.model';
import { NotesService } from '../../../../Services/customerService/notes.service';
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
import { isPlatformBrowser } from '@angular/common';
import Quill from 'quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomerServiceService } from '../../../../Services/customerService/customer-service.service';
import Swal from 'sweetalert2';
import { LocalStorageService } from '../../../../Services/local-storage.service';
import { UserLocalStorageService } from '../../../../Services/userLocalStorage.service';
declare var bootstrap: any;

@Component({
  selector: 'app-cus-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cus-notes.component.html',
  styleUrl: './cus-notes.component.css',
})
export class CusNotesComponent implements OnInit {
  @Input() customerId: any;
  notesList: CustomerNotes[] = [];
  notes: CustomerNotes;
  modalPopupAndMsg = 'Add Notes';
  service = inject(NotesService);
  cusService = inject(CustomerServiceService);
  @ViewChild('addNotesModal', { static: false }) addNotesModal!: ElementRef;
  @ViewChild('quillEditor', { static: false }) quillEditor!: ElementRef;
  quill: Quill | null = null;
  loggedUser: any;
  onSubmitForm: FormGroup;
  submitted = false;

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder
  ) {
    this.notes = new CustomerNotes();
    // Notes form validation
    this.onSubmitForm = new FormGroup({
      notesId: new FormControl(),
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      customerId: new FormControl(),
      userId: new FormControl(),
    });
  }

  ngOnInit(): void {
    //Load list on page load
    this.getNotesList(this.customerId);
    this.onSubmitForm.get('customerId')?.setValue(this.customerId);
  }

  getNotesList(id: any) {
    this.service.getNotes(id).subscribe((res: any) => {
      this.notesList = res;
    });
  }

  ngAfterViewInit() {
    // Ensure quillEditor is defined and available before using it
    if (this.quillEditor) {
      this.initializeQuillEditor();
    }
  }

  initializeQuillEditor() {
    if (this.quill) return; // Prevent duplicate instances
    import('quill')
      .then((module) => {
        const Quill = module.default;
        this.quill = new Quill(this.quillEditor.nativeElement, {
          theme: 'snow',
        });
        this.populateQuillEditor();

        this.quill.on('text-change', () => {
          this.updateHiddenInput();
        });
      })
      .catch((error) => console.error('Error initializing Quill:', error));
  }

  // Function to populate Quill editor with form field content
  populateQuillEditor() {
    const description = this.onSubmitForm.get('description')?.value;
    if (description) {
      this.quill!.root.innerHTML = description;
    }
  }

  // Method to update Angular form with editor content
  updateHiddenInput() {
    const quillContent = this.quill!.root.innerHTML;
    this.onSubmitForm.patchValue({
      description: quillContent === '<p><br></p>' ? '' : quillContent,
    });
  }

  onEditorTouched() {
    this.onSubmitForm.get('description')?.markAsTouched();
  }

  onAdd() {
    this.clearForm();
    this.notes = new CustomerNotes();
  }

  onEdit(notes: CustomerNotes) {
    this.notes = notes;
    this.onSubmitForm.patchValue({
      notesId: notes.notesId,
      title: notes.title,
      description: notes.description,
    });
    this.modalPopupAndMsg = 'Edit Notes';
    this.populateQuillEditor();
  }
  userLocalStorageService = inject(UserLocalStorageService);

  // Handle form submission
  onSubmit() {
    this.submitted = true;
    if (this.onSubmitForm.valid) {
      this.updateHiddenInput(); // Ensure the Quill content is updated in the form before submitting
      this.userLocalStorageService.user$.subscribe((user) => {
        this.loggedUser = user;
      });
      this.onSubmitForm.get('userId')?.setValue(this.loggedUser.user.userId);

      if (this.onSubmitForm.get('notesId')?.value == null) {
        this.onSubmitForm.get('notesId')?.setValue(0);
      }
      this.onSubmitForm.get('customerId')?.setValue(this.customerId);
      // Proceed with the API call
      this.service.inserNotes(this.onSubmitForm.value).subscribe({
        next: (res: any) => {
          if (res) {
            this.notes = new CustomerNotes();
            this.clearForm();
            const modal = bootstrap.Modal.getInstance(
              this.addNotesModal.nativeElement
            );
            modal.hide();
            this.getNotesList(this.customerId);
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

  // server side validation when invalid field
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }

  notesDescription!: SafeHtml;
  notesDetails(notes: CustomerNotes) {
    this.notes = notes;
    this.notesDescription = this.sanitizer.bypassSecurityTrustHtml(
      this.notes.description
    );
  }

  // Cleare submit form and quill
  clearForm() {
    this.onSubmitForm.reset();
    if (this.quill) {
      this.quill.root.innerHTML = ''; // Clear editor content
    }
  }

  DeleteNotes(id: number) {
    this.cusService.confirmDelete().then((result) => {
      if (result.isConfirmed) {
        this.service.succesDelete(id).subscribe((res: any) => {
          this.getNotesList(this.customerId);
        });
      }
    });
  }
}
export default {
  build: {
    rollupOptions: {
      external: ['quill'],
    },
  },
};

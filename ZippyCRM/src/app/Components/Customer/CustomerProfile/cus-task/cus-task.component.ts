import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CustomerTask } from '../../../../Models/cusTask.model';
import { TaskService } from '../../../../Services/customerService/task.service';
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
import { Users } from '../../../../Models/Users';
import { UsersService } from '../../../../Services/customerService/users.service';
import { CustomerServiceService } from '../../../../Services/customerService/customer-service.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;
@Component({
  selector: 'app-cus-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cus-task.component.html',
  styleUrl: './cus-task.component.css',
})
export class CusTaskComponent implements OnInit {
  taskList: CustomerTask[] = [];
  users: Users[] = [];
  task: CustomerTask;
  service = inject(TaskService);
  userService = inject(UsersService);
  cusService = inject(CustomerServiceService);
  userOptions: Array<{ value: number; text: string }> = [];
  modalPopupAndMsg = 'Create Task';
  submitted = false;

  // Task form validation
  onSubmitForm: FormGroup = new FormGroup({
    taskId: new FormControl(),
    activityType: new FormControl('', [Validators.required]),
    summary: new FormControl('', [Validators.required]),
    dueDate: new FormControl('', [Validators.required]),
   comments: new FormControl('', [Validators.required]),
    customerId: new FormControl(),
    userId: new FormControl('', [Validators.required]),
  });

  @Input() customerId!: any;
  @ViewChild('addTaskModal', { static: false }) addTaskModal!: ElementRef;

  constructor() {
    this.task = new CustomerTask();
  }

  ngOnInit(): void {
    this.getTaskList(this.customerId);
  }
  getTaskList(cId: any) {
    this.service.getTask(cId).subscribe((res: any) => {
      this.taskList = res;
    });
  }

  onAdd() {
    // reset submit form and user=''
    this.onSubmitForm.reset();
    this.onSubmitForm.reset({ userId: '' });
    // get user list for dropdown
    this.userService.getUsers().subscribe((res: any) => {
      this.users = res;
      this.userOptions = this.users.map((user) => ({
        value: user.userId,
        text: user.username,
      }));
    });
    this.modalPopupAndMsg = 'Create Task';
    this.task = new CustomerTask();
  }

  editTask(task: CustomerTask) {
    this.onSubmitForm.reset();
    this.userService.getUsers().subscribe((res: any) => {
      this.users = res;
      this.userOptions = this.users.map((user) => ({
        value: user.userId,
        text: user.username,
      }));
      this.onSubmitForm.patchValue({
        activityType: task.activityType,
        summary: task.summary,
        dueDate: task.dueDate,
        comments: task.comments,
        userId: task.userId,
        taskId: task.taskId,
      });
    });

    this.modalPopupAndMsg = 'Edit Task';
  }
  trackByUserId(index: number, user: any): number {
    return user.value; // Track by userId or any unique identifier
  }
  onSubmit() {
    this.submitted = true;
    // Submit if form is valid
    if (this.onSubmitForm.valid) {
      if (this.onSubmitForm.get('taskId')?.value == null) {
        this.onSubmitForm.get('taskId')?.setValue(0);
      }
      this.onSubmitForm.get('customerId')?.setValue(this.customerId);
      this.service.insertTask(this.onSubmitForm.value).subscribe({
        next: (res: any) => {
          if (res) {
            this.task = new CustomerTask();
            const modal = bootstrap.Modal.getInstance(
              this.addTaskModal.nativeElement
            );
            modal.hide();
            this.getTaskList(this.customerId);
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

  // Show error message if model is invalid (server-side)
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }

  taskDetails(task: CustomerTask) {
    this.task = task;
    this.modalPopupAndMsg = 'Contact Details';
  }

  //delete task
  DeleteTask(id: number) {
    this.cusService.confirmDelete().then((result) => {
      if (result.isConfirmed) {
        this.service.succesDelete(id).subscribe((res: any) => {
          this.getTaskList(this.customerId);
        });
      }
    });
  }
}

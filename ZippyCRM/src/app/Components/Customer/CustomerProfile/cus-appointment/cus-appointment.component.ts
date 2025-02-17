import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular'; // Import the FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // FullCalendar plugins
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Appointment } from '../../../../Models/cusAppointment.model';
import { AppointmentService } from '../../../../Services/customerService/appointment.service';
import { CustomerServiceService } from '../../../../Services/customerService/customer-service.service';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';
declare var bootstrap: any;

@Component({
  selector: 'app-cus-appointment',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, ReactiveFormsModule],
  templateUrl: './cus-appointment.component.html',
  styleUrl: './cus-appointment.component.css',
})
export class CusAppointmentComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent; // Access to the calendar instance
  @Input() customerId: any;
  modalPopupAndMsg = 'Create Appointment';
  appointment: Appointment;
  service = inject(AppointmentService);
  cusService = inject(CustomerServiceService);
  @ViewChild('addAppointmentModal', { static: false })
  addAppointmentModal!: ElementRef;
  submitted = false;
  private baseUrl = environment.apiUrl;

  // for appointment address
  onSubmitForm: FormGroup = new FormGroup({
    appointmentId: new FormControl(),
    cId: new FormControl(),
    subject: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  },
  { validators: [this.dateRangeValidator] }
);
  @Input() set tabChange(tabId: string) {
    if (tabId === '#profile-AppointMent') {
      this.refreshCalendar(); // Call refresh when "Appointments" tab is active
    }
  }
  // refresh calender
  refreshCalendar(): void {
    if (this.calendarComponent) {
      setTimeout(() => {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.updateSize();
        calendarApi.render();
      }, 0);
    }
  }

  // Define calendar options
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: this.fetchEvents.bind(this), // Load events via a function
    eventDrop: this.handleEventDrop.bind(this), // Handle event drop
    eventResize: this.handleEventResize.bind(this), // Handle event resize
    eventClick: this.handleEventClick.bind(this), // Handle event click
  };

  constructor(private http: HttpClient) {
    this.appointment = new Appointment();
  }

  onAdd() {
    this.onSubmitForm.reset(); // reset form on add new
    this.modalPopupAndMsg = 'Create Appointment';
  }

  onSubmit() {
    this.submitted = true;
    // Submit if valid
    if (this.onSubmitForm.valid) {
      if (this.onSubmitForm.get('appointmentId')?.value == null) {
        this.onSubmitForm.get('appointmentId')?.setValue(0);
      }
      this.onSubmitForm.get('cId')?.setValue(this.customerId);
      this.service.insertAppointment(this.onSubmitForm.value).subscribe({
        next: (res: any) => {
          if (res) {
            this.appointment = new Appointment();
            const modal = bootstrap.Modal.getInstance(
              this.addAppointmentModal.nativeElement
            );
            modal.hide();
            this.calendarOptions = {
              initialView: 'dayGridMonth',
              plugins: [dayGridPlugin, interactionPlugin],
              editable: true,
              events: this.fetchEvents.bind(this), // Binding `fetchEvents` for event fetching
              eventDrop: this.handleEventDrop.bind(this), // Handle event drop
              eventResize: this.handleEventResize.bind(this), // Handle event resize
              eventClick: this.handleEventClick.bind(this), // Handle event click
            };
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
 // Custom validator to check startDate and endDate
 dateRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return { dateRangeInvalid: true }; // Return error if invalid
  }
  return null; // No error if valid
}
// server side validation show if client side validation not work  
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }

  ngOnInit(): void {
    // load all event when page load
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      editable: true,
      events: this.fetchEvents.bind(this), // Binding `fetchEvents` for event fetching
      eventDrop: this.handleEventDrop.bind(this), // Handle event drop
      eventResize: this.handleEventResize.bind(this), // Handle event resize
      eventClick: this.handleEventClick.bind(this), // Handle event click
    };
  }

  // Method to fetch events from the backend
  fetchEvents(
    fetchInfo: any,
    successCallback: any,
    failureCallback: any
  ): void {
    this.http
      .get(
        `${this.baseUrl}api/Customer/GetAppointments/${this.customerId}`
      )
      .subscribe(
        (data: any) => {
          const events = data.map(
            (appointment: {
              appointmentid: any;
              subject: any;
              start: any;
              end: any;
              description: any;
            }) => ({
              id: appointment.appointmentid,
              title: appointment.subject,
              start: appointment.start,
              end: appointment.end,
              description: appointment.description,
            })
          );
          successCallback(events);
        },
        (error) => {
          console.error('Error loading events', error);
          failureCallback(error);
        }
      );
  }

  // Handle event drop (move event)
  handleEventDrop(eventDropInfo: { event: any; revert: () => void }): void {
    const event = eventDropInfo.event;
    const eventId = event.id || Math.random().toString(36).substring(2, 9);
    const newStart = event.start.toISOString();
    const newEnd = event.end ? event.end.toISOString() : newStart;

    const payload = {
      id: eventId,
      newStart: newStart,
      newEnd: newEnd,
    };

    this.service.updateAppointment(eventId, newStart, newEnd).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('Error updating event', error);
        eventDropInfo.revert(); // Revert the changes if failed
      },
      complete: () => {
      },
    });
  }

  // Handle event resize
  handleEventResize(eventResizeInfo: { event: any; revert: () => void }): void {
    const event = eventResizeInfo.event;
    const newStart = event.start.toISOString();
    const newEnd = event.end ? event.end.toISOString() : newStart;
    this.http
      .post(`${this.baseUrl}api/Customer/UpdateAppointment`, {
        id: event.id,
        newStart,
        newEnd,
      })
      .subscribe(
        (response) => {
        },
        (error) => {
          console.error('Error resizing event', error);
          eventResizeInfo.revert(); // Revert changes if failed
        }
      );
  }

  // Handle event click
  handleEventClick(clickInfo: { event: { id: any } }): void {
    const eventId = clickInfo.event.id;

    this.http
      .get(
        `${this.baseUrl}api/Customer/GetAppointmentDetails/${eventId}`
      )
      .subscribe(
        (data: any) => {
          // Show appointment details (can integrate with a modal)

          this.appointment = data;

          const modalElement = this.addAppointmentModal?.nativeElement;
          this.modalPopupAndMsg = 'Appointment Details';

          const modal =
            bootstrap.Modal.getInstance(modalElement) ||
            new bootstrap.Modal(modalElement);
          modal.show(); // Correct method to show the modal
        },
        (error) => {
          console.error('Error fetching appointment details', error);
        }
      );
  }

  // edit appointment
  editAppointment(appointment: Appointment) {
    this.onSubmitForm.patchValue({
      subject: appointment.subject,
      description: appointment.description,
      startDate: appointment.startDate,
      endDate: appointment.endDate,
      appointmentId: appointment.appointmentId,
    });
    this.appointment = appointment;
    this.modalPopupAndMsg = 'Edit Appointment';
    const modalElement = this.addAppointmentModal?.nativeElement;

    if (modalElement) {
      const modal =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
      modal.hide(); // Close the modal first

      // Reopen the modal after a short delay (or based on a callback)
      setTimeout(() => {
        modal.show();
      }, 500);
    }
  }
  // Delete appointment by id
  DeleteAppointment(Id: any) {
    this.cusService.confirmDelete().then((result) => {
      if (result.isConfirmed) {
        const modalElement = this.addAppointmentModal?.nativeElement;
        if (modalElement) {
          this.service.successDelete(Id).subscribe(() => {
            const modal =
              bootstrap.Modal.getInstance(modalElement) ||
              new bootstrap.Modal(modalElement);
            modal.hide();
            this.calendarOptions = {
              initialView: 'dayGridMonth',
              plugins: [dayGridPlugin, interactionPlugin],
              editable: true,
              events: this.fetchEvents.bind(this), // Binding `fetchEvents` for event fetching
              eventDrop: this.handleEventDrop.bind(this), // Handle event drop
              eventResize: this.handleEventResize.bind(this), // Handle event resize
              eventClick: this.handleEventClick.bind(this), // Handle event click
            };
          });
        }
      }
    });
  }
}

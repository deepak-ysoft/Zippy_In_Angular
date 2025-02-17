import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CusContactComponent } from '../cus-contact/cus-contact.component';
import { ContactService } from '../../../../Services/customerService/contact.service';
import { Contact } from '../../../../Models/cusContact.model';
import { Router } from '@angular/router';
import { Customer } from '../../../../Models/customer.model';
import { CommonModule } from '@angular/common';
import { CusAddressesComponent } from '../cus-addresses/cus-addresses.component';
import { AddressesService } from '../../../../Services/customerService/addresses.service';
import { Addresses } from '../../../../Models/cusAddresses.model';
import { CusTaskComponent } from '../cus-task/cus-task.component';
import { TaskService } from '../../../../Services/customerService/task.service';
import { NotesService } from '../../../../Services/customerService/notes.service';
import { AppointmentService } from '../../../../Services/customerService/appointment.service';
import { CusNotesComponent } from '../cus-notes/cus-notes.component';
import { CusAppointmentComponent } from '../cus-appointment/cus-appointment.component';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid'; // FullCalendar plugins
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { HttpClient } from '@angular/common/http';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Documents } from '../../../../Models/cusDocuments.model';
import { DocumentsService } from '../../../../Services/customerService/documents.service';
import { CusDocumentsComponent } from '../cus-documents/cus-documents.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CusContactComponent,
    CusAddressesComponent,
    CusTaskComponent,
    CusNotesComponent,
    CusAppointmentComponent,
    CusDocumentsComponent,
    CommonModule,
  ],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.css',
})
export class CustomerProfileComponent implements OnInit {
  service = inject(ContactService);
  addressService = inject(AddressesService);
  taskService = inject(TaskService);
  notesService = inject(NotesService);
  appointmentService = inject(AppointmentService);
  documentsService = inject(DocumentsService);
  http = inject(HttpClient);
  addressList: Addresses[] = [];
  ContectList: Contact[] = [];
  taskList: Contact[] = [];
  notesList: Contact[] = [];
  documentsList: Documents[] = [];
  appointmentList: Contact[] = [];
  router = inject(Router);
  customer: Customer;
  customerId: any;
  @Output() tabChanged = new EventEmitter<string>();
  @ViewChild(CusAppointmentComponent)
  appointmentComponent!: CusAppointmentComponent;
  private baseUrl = environment.apiUrl

  activeTab: string = '#profile-Contacts'; // Default tab
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: this.fetchEvents.bind(this),
  };

  constructor() {
    this.customer = new Customer();
  }

  ngOnInit(): void {
    // Retrieve customer data from the router's state
    const state = window.history.state as { customer: Customer };
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: 'dayGridMonth',
      editable: true,
      selectable: true,
      events: this.fetchEvents.bind(this),
    };
    if (state && state.customer) {
      this.customer = state.customer;
      this.getContactList(this.customer.cId);
    }
    //Tab active on customer profile
    this.activeTab = '#profile-Contacts';
    localStorage.setItem('activeTab', this.activeTab); // Ensure it's saved to localStorage
  }
  activateTab(tabId: string, customerId: number | undefined): void {
    this.activeTab = tabId;
    // Store the active tab in local storage so it persists on page reload
    localStorage.setItem('activeTab', tabId);

    // Call the respective method to load data based on the active tab
    switch (tabId) {
      case '#profile-Contacts':
        this.getContactList(customerId);
        break;
      case '#profile-Addresses':
        this.getCustomerAddresses(customerId);
        break;
      case '#profile-Task':
        this.getCustomerTasks(customerId);
        break;
      case '#profile-Notes':
        this.getCustomerNotes(customerId);
        break;
      case '#profile-Documents':
        this.getCustomerDocuments(customerId);
        break;
      case '#profile-AppointMent':
        this.getCustomerAppointMent(customerId);
        // Trigger FullCalendar refresh on the appointment component after switching tabs
        setTimeout(() => {
          if (this.appointmentComponent) {
            this.appointmentComponent.refreshCalendar(); // Call the method from the CustomerAppointmentComponent
          }
        }, 100); // Delay to ensure tab content is fully rendered
        break;
    }
  }

  getContactList(id: any) {
    this.service.getContects(id).subscribe((res: any) => {
      this.ContectList = res;
    });
  }
  getCustomerAddresses(id: any) {
    this.addressService.getAddresses(id).subscribe((res: any) => {
      this.addressList = res;
    });
  }
  getCustomerTasks(id: any) {
    this.taskService.getTask(id).subscribe((res: any) => {
      this.taskList = res;
    });
  }
  getCustomerNotes(id: any) {
    this.notesService.getNotes(id).subscribe((res: any) => {
      this.notesList = res;
    });
  }
  getCustomerDocuments(id: any) {
    this.documentsService.getDocuments(id).subscribe((res: any) => {
      this.documentsList = res;
    });
  }
  getCustomerAppointMent(customerId: any) {
    this.customerId = customerId;
    this.callFetchEvents();
  }
  callFetchEvents(): void {
    const fetchInfo = {};

    const successCallback = (events: any) => {
    };

    const failureCallback = (error: any) => {
      console.error('Failed to fetch events:', error);
    };

    // Call fetchEvents to load data
    this.fetchEvents(fetchInfo, successCallback, failureCallback);
  }
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
}

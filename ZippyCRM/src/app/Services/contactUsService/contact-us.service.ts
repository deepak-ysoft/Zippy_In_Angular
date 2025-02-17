import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContactUs } from '../../Models/contactUs.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  private contactList = new BehaviorSubject<any[]>([]);
  private contactCount = new BehaviorSubject<number>(0);

  contactList$ = this.contactList.asObservable();
  contactCount$ = this.contactCount.asObservable();

  constructor(private http: HttpClient) {}
  private readonly baseUrl = `https://localhost:7269/api/Home`;
  contactUs(data: ContactUs) {
    return this.http.post(`${this.baseUrl}/ContactUs`, data);
  }

  getContactUsList(UserId: number) {
    return this.http.get(`${this.baseUrl}/ContactUsList/${UserId}`);
  }

  updateContactUs(id: number) {
    return this.http.put(`${this.baseUrl}/UpdateContactUs/${id}`, id);
  }
  updateContactList(newList: any[], contactusCount: number) {
    this.contactList.next(newList);
    this.contactCount.next(contactusCount);
  }

  deletenotification(id:number){
    return this.http.delete(`${this.baseUrl}/DeleteNotification/${id}`);
  }
  private eventSubject = new BehaviorSubject<any>(undefined);

  triggerSomeEvent(param: any) {
    debugger;
    this.eventSubject.next(param);
  }

  getEventSubject(): BehaviorSubject<any> {
    return this.eventSubject;
  }
}

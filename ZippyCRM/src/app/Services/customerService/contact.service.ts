import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private http: HttpClient) {}
      private baseUrl = environment.apiUrl;
  getContects(customerId: number) {
    // Create HttpParams to add query parameters
    const params = new HttpParams().set('customerId', customerId.toString());

    // Pass the params in the options object correctly
    return this.http.get(`${this.baseUrl}api/Customer/ContactList`, {
      params: params,
    });
  }

  inserContact(contact: any) {
    return this.http.post(`${this.baseUrl}api/Customer/CreateEditContact`, contact);
  }
  successDelete(id: number) {
    return this.http.delete(`${this.baseUrl}api/Customer/ContactDelete/${id}`);
  }
}

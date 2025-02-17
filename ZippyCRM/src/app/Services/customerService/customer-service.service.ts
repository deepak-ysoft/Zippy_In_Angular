import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerServiceService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.apiUrl;
  getCustomerProfile(id: any) {
    return this.http.get(`${this.baseUrl}api/Customer/CustomerProfile/${id}`);
  }

  getCustomerContacts(customerId: any) {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get(`${this.baseUrl}api/Customer/ContactList?`, {
      params,
    });
  }
  getDataForEdtiCustomer(id: any) {
    return this.http.get(
      `${this.baseUrl}api/Customer/CreateEditCustomer/${id}`
    );
  }
  insertCustomer(customer: FormData): any {
    return this.http.post(
      `${this.baseUrl}api/Customer/CreateEditCustomer`,
      customer
    );
  }
  confirmDelete() {
    return Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    });
  }

  successDelete(id: any) {
    return this.http.delete(`${this.baseUrl}api/Customer/DeleteCustomer/${id}`);
  }
}

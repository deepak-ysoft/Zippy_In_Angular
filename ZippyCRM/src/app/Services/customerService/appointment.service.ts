import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private http: HttpClient) {}
    private baseUrl = environment.apiUrl;
  getAppointment(CId: any) {
    return this.http.get(`${this.baseUrl}api/Customer/GetAppointments/${CId}`);
  }

  insertAppointment(appointment: any) {
    return this.http.post(`${this.baseUrl}api/Customer/CreateEditAppointment`, appointment);
  }

  updateAppointment(
    id: string,
    newStart: string,
    newEnd: string
  ): Observable<any> {
    const payload = { id, newStart, newEnd };
    return this.http.post(`${this.baseUrl}api/Customer/UpdateAppointment`, payload);
  }
  successDelete(id: number) {
    return this.http.delete(`${this.baseUrl}api/Customer/DeleteAppointment/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { privateDecrypt } from 'crypto';
import { use } from 'echarts';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.apiUrl;
  getUsers() {
    return this.http.get(`${this.baseUrl}api/Account/GetUsersList`);
  }
  getJobs() {
    return this.http.get(`${this.baseUrl}api/Account/GetJobList`);
  }
  insertUser(user: FormData): any {
    return this.http.post(`${this.baseUrl}api/Account/Register`, user);
  }
  editUser(user: FormData): any {
    return this.http.post(`${this.baseUrl}api/Home/EditUser`, user);
  }
  login(user: any): any {
    return this.http.post(`${this.baseUrl}api/Account/login`, user);
  }

  deleteImg(userId: any) {
    return this.http.delete(`${this.baseUrl}api/Home/DeleteImage/${userId}`);
  }
  changeUserPassword(password: FormData): any {
    return this.http.post(`${this.baseUrl}api/Home/ChangePassword`, password);
  }

  forgotPassword(email: any) {
    return this.http.post(`${this.baseUrl}api/Account/forgotpassword`, email);
  }
  resetPassword(password: any) {
    return this.http.post(
      `${this.baseUrl}api/Account/reset-password`,
      password
    );
  }

  // to update notifications after login
  private eventSubject = new Subject<void>();
  triggerSomeEvent() {
    debugger;
    this.eventSubject.next();
  }
  getEventSubject(): Subject<void> {
    return this.eventSubject;
  }
}

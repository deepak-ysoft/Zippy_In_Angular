import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}
        private baseUrl = environment.apiUrl;
  getTask(CId: any) {
    return this.http.get(`${this.baseUrl}api/Customer/GetTasks/${CId}`);
  }

  insertTask(task: any) {
    return this.http.post(
      `${this.baseUrl}api/Customer/CreateEditTask
`,
      task
    );
  }
  succesDelete(id: number) {
    return this.http.delete(`${this.baseUrl}api/Customer/DeleteTask/${id}`);
  }
}

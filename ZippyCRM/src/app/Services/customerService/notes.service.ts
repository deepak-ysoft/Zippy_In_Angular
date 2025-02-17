import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private http: HttpClient) {}
      private baseUrl = environment.apiUrl;
  getNotes(CId: any) {
    return this.http.get(`${this.baseUrl}api/Customer/GetNotes/${CId}`);
  }

  inserNotes(notes: any) {
    return this.http.post(`${this.baseUrl}api/Customer/CreateEditNotes`, notes);
  }
  succesDelete(id: number) {
    return this.http.delete(`${this.baseUrl}api/Customer/DeleteNotes/${id}`);
  }
}

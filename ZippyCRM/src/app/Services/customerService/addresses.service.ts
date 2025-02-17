import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddressesService {
  private baseUrl = environment.apiUrl;
  
  http = inject(HttpClient);
  getAddresses(CId: any) {
    return this.http.get(
      `${this.baseUrl}api/Customer/GetAddreses/${CId}`
    );
  }

  insertAddress(address: any) {
    return this.http.post(
      `${this.baseUrl}api/Customer/CreateEditAddresses
`,
      address
    );
  }
  successDelete(id: number) {
    return this.http.delete(
      `${this.baseUrl}api/Customer/DeleteAddress/${id}`
    );
  }
}

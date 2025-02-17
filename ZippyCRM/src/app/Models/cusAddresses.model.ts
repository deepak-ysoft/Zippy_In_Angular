export class Addresses {
  addressId: number;
  addressName: string;
  address: string;
  email: string;
  phone: string;
  mobile: string;
  internalNotes: string;
  customerId: number;

  constructor() {
    this.addressId = 0;
    this.addressName = '';
    this.address = '';
    this.email = '';
    this.phone = '';
    this.mobile = '';
    this.internalNotes = '';
    this.customerId = 0;
  }
}

export class ContactUs {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  sendTime?: Date;
  constructor() {
    this.id = 0;
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}

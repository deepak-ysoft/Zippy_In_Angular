export class Contact {
  contactId: number;
  contactName: string;
  email: string;
  title: string;
  phone: string;
  jobPosition: string;
  mobile: string;
  internalNotes: string;
  cId: number;

  constructor(
    contactId: number = 0,
    contactName: string = '',
    email: string = '',
    title: string = '',
    phone: string = '',
    jobPosition: string = '',
    mobile: string = '',
    internalNotes: string = '',
    cId: number = 0
  ) {
    this.contactId = contactId;
    this.contactName = contactName;
    this.email = email;
    this.title = title;
    this.phone = phone;
    this.jobPosition = jobPosition;
    this.mobile = mobile;
    this.internalNotes = internalNotes;
    this.cId = cId;
  }
}

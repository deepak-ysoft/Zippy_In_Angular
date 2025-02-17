export class Appointment {
  appointmentId?: number;
  subject: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  cId: number;

  constructor() {
    this.appointmentId = 0;
    this.subject = '';
    this.description = '';
    this.cId = 0;
  }
}

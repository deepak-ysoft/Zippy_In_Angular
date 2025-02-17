export class CustomerNotes {
  notesId: number;
  title: string;
  description: string;
  customerId: number;
  userId: number;
  username?: string;
  createDate?: Date;
  updateDate?: Date;

  constructor() {
    this.notesId = 0;
    this.title = '';
    this.description = '';
    this.customerId = 0;
    this.userId = 0;
    this.username = '';
  }
}

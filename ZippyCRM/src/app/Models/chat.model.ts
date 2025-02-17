export class Chat {
  id: number;
  userId: number;
  senderId:number;
  message: string;
  timestamp?: Date;
  constructor() {
    this.id = 0;
    this.userId = 0;
    this.senderId = 0;
    this.message = '';
  }
}

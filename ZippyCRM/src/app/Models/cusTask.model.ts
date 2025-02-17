export class CustomerTask {
  taskId: number;
  activityType: string;
  summary: string;
  dueDate?: Date;
  comments: string;
  customerId: number;
  userId: number;
  username: string;
  createDate?: Date;
  updateDate?: Date;

  constructor() {
    this.taskId = 0;
    this.activityType = '';
    this.summary = '';
    this.comments = '';
    this.customerId = 0;
    this.userId = 0;
    this.username = '';
  }
}

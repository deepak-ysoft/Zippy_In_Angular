export class Message {
   id: number;
   clientUniqueId: string;
   type: string;
   content: string;
   dateTime?: Date;
   constructor() {
     this.id = 0;
     this.clientUniqueId = '';
     this.type = '';
     this.content = '';
   }
 }
 
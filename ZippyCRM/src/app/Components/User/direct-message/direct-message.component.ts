import {
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DirectMessageService } from '../../../Services/MessageService/direct-message.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { UserLocalStorageService } from '../../../Services/userLocalStorage.service';
import { Users } from '../../../Models/Users';
import { UsersService } from '../../../Services/customerService/users.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.css'],
})
export class DirectMessageComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  messages: {
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: Date;
  }[] = [];
  currentMessage: string = '';
  otherUser: any; // Replace dynamically
  currentUserid: string = ''; // Replace with authenticated user
  userLocalstorageService = inject(UserLocalStorageService);
  users = inject(UsersService);
  loggedUser: any;
  userList: Users[] = [];
  isGetUserClicked = false;

  constructor(private messageService: DirectMessageService) {}

  ngOnInit(): void {
    this.isGetUserClicked = false;
    debugger;
    this.userLocalstorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
    this.users.getUsers().subscribe((res: any) => {
      if (res) {
        this.userList = res;
      }
    });
    // Start SignalR connection
    this.messageService
      .startConnection()
      .then(() => {
        console.log('Connection established. Fetching chat history...');
        // Fetch chat history after connection is established
        return this.messageService.getChatHistory(
          this.loggedUser.user.userId,
          0
        );
      })
      .then((history) => {
        this.messages = history;
      })
      .catch((err) => {
        console.error('Error during initialization:', err);
      });

    // Listen for incoming messages
    this.messageService.onReceiveMessage(
      (senderId, receiverId, message, timestamp) => {
        // Check if the sender is not the logged-in user
        if (senderId !== this.loggedUser.user.userId) {
          this.messages.push({ senderId, receiverId, message, timestamp });
        }
        setTimeout(() => this.scrollToBottom(), 500);
      }
    );
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    }
  }

  getUserChatHistory(user: any) {
    debugger;
    this.isGetUserClicked = true;
    this.otherUser = user;
    console.log(this.otherUser);
    this.messageService
      .startConnection()
      .then(() => {
        console.log('Connection established. Fetching chat history...');
        // Fetch chat history after connection is established
        return this.messageService.getChatHistory(
          this.loggedUser.user.userId,
          this.otherUser.userId
        );
      })
      .then((history) => {
        this.messages = history;

        console.log('messages-------', this.messages);
        setTimeout(() => this.scrollToBottom(), 0);
      })
      .catch((err) => {
        console.error('Error during initialization:', err);
      });

    // Listen for incoming messages
    this.messageService.onReceiveMessage(
      (senderId, receiverId, message, timestamp) => {
        this.messages.push({ senderId, receiverId, message, timestamp });
      }
    );
  }

  sendMessage(): void {
    debugger;
    if (this.currentMessage.trim()) {
      this.messageService
        .sendMessage(
          this.loggedUser.user.userId,
          this.otherUser.userId,
          this.currentMessage
        )
        .then(() => {
          this.messages.push({
            senderId: this.loggedUser.user.userId,
            receiverId: this.otherUser.userId,
            message: this.currentMessage,
            timestamp: new Date(),
          });
          setTimeout(() => this.scrollToBottom(), 0);
          console.log(this.messages);
          this.currentMessage = ''; // Clear input
        })
        .catch((err) => {
          console.error('Error sending message:', err);
        });
    }
  }
}

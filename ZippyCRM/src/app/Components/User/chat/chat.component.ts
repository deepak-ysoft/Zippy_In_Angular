import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../../Services/MessageService/chat.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  chatService = inject(ChatService);
  inputMessage = '';
  messages: any[] = [];
  router = inject(Router);
  loggedInUserName = sessionStorage.getItem('user');
  roomName = sessionStorage.getItem('room');
  preventReload = true; // Flag to control reload behavior

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.preventReload) {
      event.preventDefault();
      event.returnValue = ''; // Some browsers require this for confirmation
    }
  }
  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  ngOnInit(): void {
    this.chatService.messages$.subscribe((res) => {
      this.messages = res;
      console.log(this.messages);
    });

    this.chatService.connectedUsers$.subscribe((res) => {
      console.log(res);
    });
    setTimeout(() => this.scrollToBottom(), 0);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    }
  }
  sendMessage() {
    if (this.inputMessage.trim()) {
      this.chatService
        .sendMessage(this.inputMessage)
        .then(() => {
          this.inputMessage = '';
          setTimeout(() => this.scrollToBottom(), 0);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  leaveChat() {
    this.chatService
      .leaveChat()
      .then(() => {
        this.router.navigate(['join-chat']);
        setTimeout(() => {
          location.reload();
        }, 0);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

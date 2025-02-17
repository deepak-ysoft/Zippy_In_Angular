import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../../Services/MessageService/chat.service';
import { UserLocalStorageService } from '../../../Services/userLocalStorage.service';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.css',
})
export class JoinRoomComponent implements OnInit {
  joinRoomForm!: FormGroup;
  fb = inject(FormBuilder);
  router = inject(Router);
  chatService = inject(ChatService);
  userLocalstorageService = inject(UserLocalStorageService);
  loggedUser: any;

  ngOnInit(): void {
    this.joinRoomForm = this.fb.group({
      user: [],
      room: ['', Validators.required],
    });
    this.userLocalstorageService.user$.subscribe((user) => {
      this.loggedUser = user;
    });
  }

  joinRoom() {
    debugger;
    this.joinRoomForm.get('user')?.setValue(this.loggedUser.user.username);
    const { user, room } = this.joinRoomForm.value;
    sessionStorage.setItem('user', user);
    sessionStorage.setItem('room', room);
    this.chatService
      .joinRoom(user, room)
      .then(() => {
        this.router.navigate(['chat-with-user']);
      })
      .catch((err) => {});
  }
}

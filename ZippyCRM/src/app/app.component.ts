import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LocalStorageService } from './Services/local-storage.service';
import { ChatService } from './Services/MessageService/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [ChatService],
})
export class AppComponent {
  title = 'ZippyCRM';
}

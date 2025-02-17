import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DirectMessageService {
  private hubConnection!: signalR.HubConnection;
  private baseUrl = environment.apiUrl;
  constructor(private authService: AuthService) {}

  // Start SignalR connection
  startConnection(): Promise<void> {
    debugger;
    const token = this.authService.getToken(); // Get the JWT token from AuthService

    // Check if the token is available
    if (!token) {
      return Promise.reject('No token available.');
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}DirectMessageHub`, {
        accessTokenFactory: () => token,
      })
      .configureLogging(signalR.LogLevel.Debug)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onreconnecting(() => console.warn('Reconnecting...'));
    this.hubConnection.onreconnected(() => console.log('Reconnected!'));

    return this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch((err) => {
        console.error('SignalR connection error:', err);
        throw err;
      });
  }

  // Send a message via SignalR
  sendMessage(
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke(
        'SendMessage',
        senderId,
        receiverId,
        message
      );
    } else {
      return Promise.reject(
        'SignalR connection is not in the Connected state.'
      );
    }
  }

  // Get chat history via SignalR
  getChatHistory(userId: number, otherUserId: number): Promise<any[]> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke('GetChatHistory', userId, otherUserId);
    } else {
      return Promise.reject(
        'SignalR connection is not in the Connected state.'
      );
    }
  }

  // Listen for incoming messages
  onReceiveMessage(
    callback: (
      sender: string,
      receiverId: string,
      message: string,
      timestamp: Date
    ) => void
  ): void {
    this.hubConnection.on(
      'ReceiveMessage',
      (sender, receiverId, message, timestamp) => {
        console.log(
          'Message received:',
          sender,
          receiverId,
          message,
          timestamp
        );
        callback(sender, receiverId, message, timestamp); // You can call a callback here to update your UI
      }
    );
  }
}

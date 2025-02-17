import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private lastActivityKey = 'lastActivityTimestamp'; // Key for tracking last activity timestamp
  private sessionKey = 'isSessionActive'; // Key to track session activity
  private clearDuration = 5000; // Set to 5 seconds for testing purposes (adjust as needed)

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkBrowserClose();
      this.trackBrowserClose();
    }
  }

  // Clear localStorage
  private clearLocalStorage(): void {
    localStorage.clear();
  }

  // Check browser close or reload on startup
  private checkBrowserClose(): void {
    const lastActivity = localStorage.getItem(this.lastActivityKey);
    const now = Date.now();

    if (lastActivity && now - parseInt(lastActivity, 10) > this.clearDuration) {
      this.clearLocalStorage();
    }

    // Set the session active
    sessionStorage.setItem(this.sessionKey, 'true');
  }

  // Track browser/tab close
  private trackBrowserClose(): void {
    window.addEventListener('beforeunload', () => {
      if (sessionStorage.getItem(this.sessionKey)) {
        // Save the last activity timestamp only on browser close
        localStorage.setItem(this.lastActivityKey, Date.now().toString());
      }
    });
  }
}

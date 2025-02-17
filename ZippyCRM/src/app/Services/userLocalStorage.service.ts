import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserLocalStorageService {
  private userKey = 'user'; // Key for localStorage
  private userSubject: BehaviorSubject<any>; // Subject for emitting user data
  public user$: Observable<any>; // Observable to subscribe to for user data

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize user$ after checking the user data from localStorage
    if (this.isBrowser()) {
      const userData = this.getUserFromStorage();
      this.userSubject = new BehaviorSubject<any>(userData);
    } else {
      this.userSubject = new BehaviorSubject<any>(null); // Default to null if not in the browser
    }
    this.user$ = this.userSubject.asObservable();
  }

  // Safely access localStorage only in the browser
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getUserFromStorage(): any {
    if (this.isBrowser()) {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  setUser(user: any): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.userSubject.next(user); // Notify subscribers with the new user
  }

  clearUser(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.userKey);
    }
    this.userSubject.next(null); // Notify subscribers with null
  }

  getCurrentUser(): any {
    return this.userSubject.getValue();
  }
}

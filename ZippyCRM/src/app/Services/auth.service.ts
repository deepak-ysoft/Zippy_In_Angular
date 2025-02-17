import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem('jwtToken'); // or sessionStorage.getItem('authToken')
  }

  // Check if the user is authenticated (returns a boolean)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

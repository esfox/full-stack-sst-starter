import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './_api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService {
  router = inject(Router);

  isLoggingOut = signal(false);

  constructor() {
    super();
  }

  loginUrl = new URL('auth/google/authorize', this.baseUrl).toString();

  async logout() {
    this.isLoggingOut.set(true);

    try {
      const response = await this.fetch('/logout', { method: 'POST' });
      if (!response.ok) {
        // TODO: Handle errors?
        return;
      }

      this.isLoggingOut.set(false);
      this.router.navigate(['/login']);
    } catch (error) {
      //  TODO: handle error
      console.error(error);
    }
  }
}

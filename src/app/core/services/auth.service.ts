// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface AddressDTO {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: AddressDTO | null;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<AuthResponse | null>;
  public currentUser: Observable<AuthResponse | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  login(request: AuthenticationRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/authenticate`, request)
      .pipe(
        tap(response => {
          // Store user details and JWT token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
          this.notificationService.success(`Welcome back, ${response.firstName}!`);
        }),
        catchError(error => {
          this.notificationService.error(`Login failed: ${error.error?.message || 'Invalid username or password'}`);
          return throwError(() => error);
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => {
          // Store user details and JWT token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
          this.notificationService.success(`Welcome to Aptio, ${response.firstName}! Your account has been created.`);
        }),
        catchError(error => {
          this.notificationService.error(`Registration failed: ${error.error?.message || 'Please check your information and try again'}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Navigate based on user role
   * Returns the appropriate route path based on the user's role
   */
  getHomeRouteBasedOnRole(): string {
    const user = this.currentUserValue;
    if (!user) {
      return '/auth/login';
    }

    if (this.isAdmin()) {
      return '/dashboard';
    } else if (this.isStaff()) {
      return '/dashboard/appointments';
    } else {
      return '/dashboard/profile';
    }
  }

  logout(): void {
    // Remove user from local storage and reset the subject
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.notificationService.info('You have been logged out successfully');
    this.router.navigate(['/auth/login']);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user !== null && user.roles && user.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isStaff(): boolean {
    return this.hasRole('ROLE_STAFF') || this.isAdmin();
  }
}

// src/app/core/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
  birthDate?: string;
  profilePhoto?: string;
  roles: string[];
  active: boolean;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  /**
   * Get current user's profile
   */
  getCurrentProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/me`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load profile. Please try again.');
          return throwError(() => error);
        })
      );
  }

  /**
   * Update current user's profile
   */
  updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/me`, profileData)
      .pipe(
        tap(result => {
          this.notificationService.success('Profile updated successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update profile. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Change user's password
   */
  changePassword(passwordData: PasswordUpdate): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, passwordData)
      .pipe(
        tap(result => {
          this.notificationService.success('Password changed successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to change password. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }


}

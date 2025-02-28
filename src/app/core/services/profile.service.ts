// src/app/core/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Address } from './customers.service';

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

  constructor(private http: HttpClient) {}

  // Get current user profile
  getCurrentProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/me`)
      .pipe(catchError(this.handleError<UserProfile>('getCurrentProfile')));
  }

  // Update user profile
  updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/me`, profileData)
      .pipe(catchError(this.handleError<UserProfile>('updateProfile')));
  }

  // Change password
  changePassword(passwordData: PasswordUpdate): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, passwordData)
      .pipe(catchError(this.handleError<any>('changePassword')));
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}

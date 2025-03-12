// src/app/core/services/settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface BusinessSettings {
  id?: number;
  businessName: string;
  businessHoursStart: string; // Format: HH:MM
  businessHoursEnd: string; // Format: HH:MM
  daysOpen: string; // 7-length string of 0/1, e.g., "0111110" means closed on Sun & Sat
  defaultAppointmentDuration: number; // in minutes
  timeSlotInterval: number; // in minutes
  allowOverlappingAppointments: boolean;
  bufferTimeBetweenAppointments: number; // in minutes
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = environment.apiUrl;
  private readonly daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  /**
   * Get business settings
   */
  getBusinessSettings(): Observable<BusinessSettings> {
    return this.http.get<BusinessSettings>(`${this.apiUrl}/settings/business`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load business settings. Please try again.');
          return throwError(() => error);
        })
      );
  }

  /**
   * Update business settings
   */
  updateBusinessSettings(settings: BusinessSettings): Observable<BusinessSettings> {
    return this.http.put<BusinessSettings>(`${this.apiUrl}/settings/business`, settings)
      .pipe(
        tap(result => {
          this.notificationService.success('Business settings updated successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update business settings. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get list of days of the week
   */
  getDaysOfWeek(): string[] {
    return this.daysOfWeek;
  }

  /**
   * Convert daysOpen string to array of booleans
   * @param daysOpen 7-character string of '0' and '1'
   */
  daysOpenStringToArray(daysOpen: string): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      result.push(i < daysOpen.length ? daysOpen.charAt(i) === '1' : false);
    }
    return result;
  }

  /**
   * Convert array of booleans to daysOpen string
   * @param daysOpen Array of 7 boolean values
   */
  daysOpenArrayToString(daysOpen: boolean[]): string {
    return daysOpen.map(isOpen => isOpen ? '1' : '0').join('');
  }
}

// src/app/core/services/settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) {}

  // Get business settings
  getBusinessSettings(): Observable<BusinessSettings> {
    return this.http.get<BusinessSettings>(`${this.apiUrl}/settings/business`)
      .pipe(catchError(this.handleError<BusinessSettings>('getBusinessSettings', this.getDefaultSettings())));
  }

  // Update business settings
  updateBusinessSettings(settings: BusinessSettings): Observable<BusinessSettings> {
    return this.http.put<BusinessSettings>(`${this.apiUrl}/settings/business`, settings)
      .pipe(catchError(this.handleError<BusinessSettings>('updateBusinessSettings')));
  }

  // Convert daysOpen array to string format
  daysOpenArrayToString(daysArray: boolean[]): string {
    return daysArray.map(day => day ? '1' : '0').join('');
  }

  // Convert daysOpen string to array format
  daysOpenStringToArray(daysString: string): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      result.push(i < daysString.length ? daysString.charAt(i) === '1' : false);
    }
    return result;
  }

  // Get days of week as string array
  getDaysOfWeek(): string[] {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  // Get default settings if API fails
  private getDefaultSettings(): BusinessSettings {
    return {
      businessName: 'Aptio Appointment System',
      businessHoursStart: '09:00',
      businessHoursEnd: '18:00',
      daysOpen: '0111110', // Mon-Fri
      defaultAppointmentDuration: 30,
      timeSlotInterval: 15,
      allowOverlappingAppointments: false,
      bufferTimeBetweenAppointments: 5,
      address: '123 Business St, City, State 12345',
      phone: '555-123-4567',
      email: 'contact@aptio.com',
      website: 'https://aptio.com'
    };
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

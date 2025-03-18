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

export interface ScheduleEntry {
  id: string;
  staffId: string;
  staffName?: string;
  resourceId?: string;
  resourceName?: string;
  appointmentId?: string;
  title: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  notes?: string;
  type: 'APPOINTMENT' | 'BREAK' | 'TIMEOFF' | 'OTHER';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  color?: string;
}

export interface Staff {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  specialties: Set<string>;
  color: string;
  avatar?: string;
  isActive: boolean;
  workHours: WorkHours[];
}

export interface WorkHours {
  id?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  breaks: TimeSlot[];
}

export interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImprovedScheduleService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // Get business settings
  getBusinessSettings(): Observable<BusinessSettings> {
    return this.http.get<BusinessSettings>(`${this.apiUrl}/settings/business`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load business settings. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Update business settings
  updateBusinessSettings(settings: BusinessSettings): Observable<BusinessSettings> {
    return this.http.put<BusinessSettings>(`${this.apiUrl}/settings/business`, settings).pipe(
      tap(() => {
        this.notificationService.success('Business settings updated successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to update business settings. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }

  // Get all staff
  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/staff?active=true`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load staff members. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Get staff member by ID
  getStaffById(id: string): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/staff/${id}`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load staff details. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Get schedule entries for a specific date range
  getScheduleEntries(startDate: string, endDate: string): Observable<ScheduleEntry[]> {
    return this.http.get<ScheduleEntry[]>(`${this.apiUrl}/schedule/range?startDate=${startDate}&endDate=${endDate}`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load schedule entries. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Get schedule entries for a specific staff member
  getStaffSchedule(staffId: string, startDate: string, endDate: string): Observable<ScheduleEntry[]> {
    return this.http.get<ScheduleEntry[]>(`${this.apiUrl}/schedule/staff/${staffId}?startDate=${startDate}&endDate=${endDate}`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load staff schedule. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Create a new schedule entry
  createScheduleEntry(entry: Partial<ScheduleEntry>): Observable<ScheduleEntry> {
    return this.http.post<ScheduleEntry>(`${this.apiUrl}/schedule`, entry).pipe(
      tap(() => {
        this.notificationService.success('Schedule entry created successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to create schedule entry. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }

  // Update an existing schedule entry
  updateScheduleEntry(id: string, entry: Partial<ScheduleEntry>): Observable<ScheduleEntry> {
    return this.http.put<ScheduleEntry>(`${this.apiUrl}/schedule/${id}`, entry).pipe(
      tap(() => {
        this.notificationService.success('Schedule entry updated successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to update schedule entry. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }

  // Delete a schedule entry
  deleteScheduleEntry(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/schedule/${id}`).pipe(
      tap(() => {
        this.notificationService.success('Schedule entry deleted successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to delete schedule entry. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }

  // Get available time slots for a specific date, service, and staff
  getAvailableTimeSlots(date: string, serviceId: string, staffId?: string): Observable<string[]> {
    let url = `${this.apiUrl}/appointments/available-slots?date=${date}&serviceId=${serviceId}`;
    if (staffId) {
      url += `&staffId=${staffId}`;
    }
    return this.http.get<string[]>(url).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load available time slots. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Convert daysOpen string to array
  daysOpenStringToArray(daysString: string): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      result.push(i < daysString.length ? daysString.charAt(i) === '1' : false);
    }
    return result;
  }

  // Format date as YYYY-MM-DD
  formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Parse time string (HH:MM) to minutes
  parseTimeToMinutes(time: any): number {
    try {
      return time[0] * 60 + time[1];
    } catch (err) {
      console.error('Error parsing time to minutes:', time, err);
      return 0;
    }
  }

  // Format minutes to time string (HH:MM)
  formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Format time for display (12-hour format)
  formatTimeForDisplay(time: string): string {
    if (!time) return '';

    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (err) {
      console.error('Error formatting time:', time, err);
      return time; // Return original if there's an error
    }
  }

  // Get the start of the week (Sunday) for a given date
  getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  // Get day name from day of week number
  getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  // Get entry type class for styling
  getEntryTypeClass(type: string): string {
    switch (type.toUpperCase()) {
      case 'APPOINTMENT':
        return 'bg-primary-light text-primary';
      case 'BREAK':
        return 'bg-yellow-100 text-yellow-800';
      case 'TIMEOFF':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-light text-neutral-dark';
    }
  }
}

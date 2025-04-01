import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface WorkHours {
  id?: string;
  dayOfWeek: number;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  breaks: TimeSlot[];
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

export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  specialties?: string[];
  color?: string;
  avatar?: string;
  isActive: boolean;
  workHours?: WorkHours[];
}
interface ApiStaff {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  specialties: string[];
  color: string;
  avatar?: string;
  isActive: boolean;
  workHours: WorkHours[];
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = environment.apiUrl + '/staff';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}
  getStaff(): Observable<Staff[]> {
    return this.http.get<ApiStaff[]>(this.apiUrl).pipe(
      map(staff => staff.map(s => this.mapApiStaffToStaff(s))),
      catchError(error => {
        this.notificationService.error('Failed to load staff members. Please try again.');
        return throwError(() => error);
      })
    );
  }
  getActiveStaff(): Observable<Staff[]> {
    return this.http.get<ApiStaff[]>(`${this.apiUrl}?active=true`).pipe(
      map(staff => staff.map(s => this.mapApiStaffToStaff(s))),
      catchError(error => {
        this.notificationService.error('Failed to load active staff members. Please try again.');
        return throwError(() => error);
      })
    );
  }
  getStaffById(id: string): Observable<Staff> {
    return this.http.get<ApiStaff>(`${this.apiUrl}/${id}`).pipe(
      map(staff => this.mapApiStaffToStaff(staff)),
      catchError(error => {
        this.notificationService.error(`Failed to load staff details. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }
  getStaffBySpecialty(specialty: string): Observable<Staff[]> {
    return this.http.get<ApiStaff[]>(`${this.apiUrl}?specialty=${specialty}`).pipe(
      map(staff => staff.map(s => this.mapApiStaffToStaff(s))),
      catchError(error => {
        this.notificationService.error(`Failed to load staff with specialty ${specialty}. Please try again.`);
        return throwError(() => error);
      })
    );
  }
  createStaff(staffData: StaffFormData): Observable<Staff> {
    const apiStaffData = {
      ...staffData,
      specialties: staffData.specialties || []
    };

    return this.http.post<ApiStaff>(this.apiUrl, apiStaffData).pipe(
      map(staff => this.mapApiStaffToStaff(staff)),
      tap(() => {
        this.notificationService.success('Staff member created successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to create staff member. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }
  updateStaff(id: string, staffData: StaffFormData): Observable<Staff> {
    const apiStaffData = {
      ...staffData,
      specialties: staffData.specialties || []
    };

    return this.http.put<ApiStaff>(`${this.apiUrl}/${id}`, apiStaffData).pipe(
      map(staff => this.mapApiStaffToStaff(staff)),
      tap(() => {
        this.notificationService.success('Staff member updated successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to update staff member. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }
  deleteStaff(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notificationService.success('Staff member deleted successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to delete staff member. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }
  toggleStaffStatus(id: string, active: boolean): Observable<Staff> {
    return this.http.patch<ApiStaff>(`${this.apiUrl}/${id}/status`, { active }).pipe(
      map(staff => this.mapApiStaffToStaff(staff)),
      tap(() => {
        const status = active ? 'activated' : 'deactivated';
        this.notificationService.success(`Staff member ${status} successfully!`);
      }),
      catchError(error => {
        this.notificationService.error(`Failed to update staff status. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }
  updateWorkHours(id: string, workHours: WorkHours[]): Observable<Staff> {
    return this.http.put<ApiStaff>(`${this.apiUrl}/${id}/schedule`, { workHours }).pipe(
      map(staff => this.mapApiStaffToStaff(staff)),
      tap(() => {
        this.notificationService.success('Work schedule updated successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Failed to update work schedule. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }
  private mapApiStaffToStaff(apiStaff: ApiStaff): Staff {
    return {
      ...apiStaff,
      specialties: new Set(apiStaff.specialties),
      workHours: apiStaff.workHours || this.generateDefaultWorkHours()
    };
  }
  generateDefaultWorkHours(): WorkHours[] {
    const workHours: WorkHours[] = [];

    for (let i = 0; i < 7; i++) {
      const isWorkingDay = i > 0 && i < 6;

      const dayHours: WorkHours = {
        dayOfWeek: i,
        isWorking: isWorkingDay,
        startTime: isWorkingDay ? '09:00' : undefined,
        endTime: isWorkingDay ? '17:00' : undefined,
        breaks: []
      };
      if (isWorkingDay) {
        dayHours.breaks.push({
          startTime: '12:00',
          endTime: '13:00',
          note: 'Lunch break'
        });
      }

      workHours.push(dayHours);
    }

    return workHours;
  }
  getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  }
  formatTime(time: any): string {
    if (!time) return '';

    try {
      const date = new Date();
      date.setHours(time[0]);
      date.setMinutes(time[1]);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (err) {
      console.error('Error formatting time:', time, err);
      return String(time);
    }
  }
}

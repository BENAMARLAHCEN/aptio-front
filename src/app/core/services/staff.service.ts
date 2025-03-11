// src/app/core/services/staff.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface WorkHours {
  id?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
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

// Interface for API responses
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
  private apiUrl = 'http://localhost:8080/api/v1/staff';

  constructor(private http: HttpClient) {}

  // Get all staff members
  getStaff(): Observable<Staff[]> {
    return this.http.get<ApiStaff[]>(this.apiUrl).pipe(
      map(staff => staff.map(s => this.mapApiStaffToStaff(s)))
    );
  }

  // Get active staff members
  getActiveStaff(): Observable<Staff[]> {
    return this.http.get<ApiStaff[]>(`${this.apiUrl}?active=true`).pipe(
      map(staff => staff.map(s => this.mapApiStaffToStaff(s)))
    );
  }

  // Get staff by ID
  getStaffById(id: string): Observable<Staff> {
    return this.http.get<ApiStaff>(`${this.apiUrl}/${id}`).pipe(
      map(staff => this.mapApiStaffToStaff(staff))
    );
  }

  // Get staff by specialty
  getStaffBySpecialty(specialty: string): Observable<Staff[]> {
    return this.http.get<ApiStaff[]>(`${this.apiUrl}?specialty=${specialty}`).pipe(
      map(staff => staff.map(s => this.mapApiStaffToStaff(s)))
    );
  }

  // Create new staff
  createStaff(staffData: StaffFormData): Observable<Staff> {
    // Transform to API format
    const apiStaffData = {
      ...staffData,
      specialties: staffData.specialties || []
    };

    return this.http.post<ApiStaff>(this.apiUrl, apiStaffData).pipe(
      map(staff => this.mapApiStaffToStaff(staff))
    );
  }

  // Update existing staff
  updateStaff(id: string, staffData: StaffFormData): Observable<Staff> {
    // Transform to API format
    const apiStaffData = {
      ...staffData,
      specialties: staffData.specialties || []
    };

    return this.http.put<ApiStaff>(`${this.apiUrl}/${id}`, apiStaffData).pipe(
      map(staff => this.mapApiStaffToStaff(staff))
    );
  }

  // Delete staff
  deleteStaff(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle staff active status
  toggleStaffStatus(id: string, active: boolean): Observable<Staff> {
    return this.http.patch<ApiStaff>(`${this.apiUrl}/${id}/status`, { active }).pipe(
      map(staff => this.mapApiStaffToStaff(staff))
    );
  }

  // Update staff work hours
  updateWorkHours(id: string, workHours: WorkHours[]): Observable<Staff> {
    return this.http.put<ApiStaff>(`${this.apiUrl}/${id}/schedule`, { workHours }).pipe(
      map(staff => this.mapApiStaffToStaff(staff))
    );
  }

  // Helper to transform API response to app model
  private mapApiStaffToStaff(apiStaff: ApiStaff): Staff {
    return {
      ...apiStaff,
      specialties: new Set(apiStaff.specialties),
      workHours: apiStaff.workHours || this.generateDefaultWorkHours()
    };
  }

  // Generate default work hours for a new staff member
  generateDefaultWorkHours(): WorkHours[] {
    const workHours: WorkHours[] = [];

    for (let i = 0; i < 7; i++) {
      // Default to working Monday-Friday (1-5)
      const isWorkingDay = i > 0 && i < 6;

      const dayHours: WorkHours = {
        dayOfWeek: i,
        isWorking: isWorkingDay,
        startTime: isWorkingDay ? '09:00' : undefined,
        endTime: isWorkingDay ? '17:00' : undefined,
        breaks: []
      };

      // Add lunch break for working days
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

  // Get day name from day number
  getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  }

  // Format time for display
  formatTime(time: any): string {
    const date = new Date();
    date.setHours(time[0]);
    date.setMinutes(time[1]);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
}

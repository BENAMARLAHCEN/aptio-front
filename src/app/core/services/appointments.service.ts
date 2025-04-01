import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  staffId?: string;
  staffName?: string;
  date: any;
  time: string;
  duration: number;
  status: string;
  notes?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStatus {
  value: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  label: string;
  color: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AppointmentFormData {
  customerId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  time: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private apiUrl = environment.apiUrl;
  readonly statusOptions: AppointmentStatus[] = [
    { value: 'pending', label: 'Pending', color: '#FFC107' },
    { value: 'confirmed', label: 'Confirmed', color: '#4CAF50' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
    { value: 'completed', label: 'Completed', color: '#2196F3' }
  ];

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load appointments. Please try again.');
          return throwError(() => error);
        })
      );
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`)
      .pipe(
        catchError(error => {
          this.notificationService.error(`Failed to load appointment details. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  createAppointment(appointmentData: AppointmentFormData): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointmentData)
      .pipe(
        tap(() => {
          this.notificationService.success('Appointment created successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to create appointment. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  updateAppointment(id: string, appointmentData: Partial<AppointmentFormData>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, appointmentData)
      .pipe(
        tap(() => {
          this.notificationService.success('Appointment updated successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update appointment. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${id}`)
      .pipe(
        tap(() => {
          this.notificationService.success('Appointment deleted successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to delete appointment. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus['value']): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${id}/status`, { status })
      .pipe(
        tap(() => {
          this.notificationService.success(`Appointment status updated to ${status}!`);
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update appointment status. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load services. Please try again.');
          return throwError(() => error);
        })
      );
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load customers. Please try again.');
          return throwError(() => error);
        })
      );
  }

  getAvailableTimeSlots(date: string, serviceId: string, staffId?: string): Observable<string[]> {
    let url = `${this.apiUrl}/appointments/available-slots?date=${date}&serviceId=${serviceId}`;
    if (staffId) {
      url += `&staffId=${staffId}`;
    }
    return this.http.get<string[]>(url)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load available time slots. Please try again.');
          return throwError(() => error);
        })
      );
  }

  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?startDate=${startDate}&endDate=${endDate}`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load appointments for the selected date range. Please try again.');
          return throwError(() => error);
        })
      );
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?date=${date}`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load appointments for the selected date. Please try again.');
          return throwError(() => error);
        })
      );
  }

  getAppointmentsByCustomerId(customerId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?customerId=${customerId}`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load customer appointments. Please try again.');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get appointments for the current authenticated user
   * @param status Optional status filter
   * @returns Observable with list of user's appointments
   */
  getUserAppointments(status?: string): Observable<Appointment[]> {
    let url = `${this.apiUrl}/user/appointments`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<Appointment[]>(url)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load your appointments. Please try again.');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get a specific appointment for the current user
   * @param id Appointment ID
   * @returns Observable with appointment details
   */
  getUserAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/user/appointments/${id}`)
      .pipe(
        catchError(error => {
          this.notificationService.error(`Failed to load appointment details. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cancel an appointment for the current user
   * @param id Appointment ID
   * @returns Observable with updated appointment
   */
  cancelUserAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/user/appointments/${id}/cancel`, {})
      .pipe(
        tap(() => {
          this.notificationService.success('Your appointment has been cancelled successfully.');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to cancel appointment. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  createUserAppointment(appointmentData: Partial<AppointmentFormData>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/user/appointments`, appointmentData)
      .pipe(
        tap(() => {
          this.notificationService.success('Your appointment has been scheduled successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to schedule appointment. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
}

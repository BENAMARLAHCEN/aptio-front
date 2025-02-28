// src/app/core/services/appointments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  staffId?: string;
  staffName?: string;
  date: string;
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

  // Status options for appointments
  readonly statusOptions: AppointmentStatus[] = [
    { value: 'pending', label: 'Pending', color: '#FFC107' },
    { value: 'confirmed', label: 'Confirmed', color: '#4CAF50' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
    { value: 'completed', label: 'Completed', color: '#2196F3' }
  ];

  constructor(private http: HttpClient) {}

  // Get all appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`)
        .pipe(catchError(this.handleError<Appointment[]>('getAppointments', [])));
  }

  // Get appointment by ID
  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`)
        .pipe(catchError(this.handleError<Appointment>('getAppointmentById')));
  }

  // Create new appointment
  createAppointment(appointmentData: AppointmentFormData): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointmentData)
        .pipe(catchError(this.handleError<Appointment>('createAppointment')));
  }

  // Update existing appointment
  updateAppointment(id: string, appointmentData: Partial<AppointmentFormData>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, appointmentData)
        .pipe(catchError(this.handleError<Appointment>('updateAppointment')));
  }

  // Delete appointment
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${id}`)
        .pipe(catchError(this.handleError<any>('deleteAppointment')));
  }

  // Change appointment status
  updateAppointmentStatus(id: string, status: AppointmentStatus['value']): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${id}/status`, { status })
        .pipe(catchError(this.handleError<Appointment>('updateAppointmentStatus')));
  }

  // Get all services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`)
        .pipe(catchError(this.handleError<Service[]>('getServices', [])));
  }

  // Get all customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
        .pipe(catchError(this.handleError<Customer[]>('getCustomers', [])));
  }

  // Get appointment status by value
  getStatusDetails(statusValue: AppointmentStatus['value']): AppointmentStatus {
    const status = this.statusOptions.find(s => s.value === statusValue);
    return status || this.statusOptions[0];
  }

  // Get available time slots for a specific date
  getAvailableTimeSlots(date: string, serviceId: string, staffId?: string): Observable<string[]> {
    let url = `${this.apiUrl}/appointments/available-slots?date=${date}&serviceId=${serviceId}`;
    if (staffId) {
      url += `&staffId=${staffId}`;
    }
    return this.http.get<string[]>(url)
        .pipe(catchError(this.handleError<string[]>('getAvailableTimeSlots', [])));
  }


  // Get appointments by date range
  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?startDate=${startDate}&endDate=${endDate}`)
        .pipe(catchError(this.handleError<Appointment[]>('getAppointmentsByDateRange', [])));
  }

  // Get appointments for a specific date
  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?date=${date}`)
        .pipe(catchError(this.handleError<Appointment[]>('getAppointmentsByDate', [])));
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


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

  constructor(private http: HttpClient) {}
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`)
        .pipe(catchError(this.handleError<Appointment[]>('getAppointments', [])));
  }
  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`)
        .pipe(catchError(this.handleError<Appointment>('getAppointmentById')));
  }
  createAppointment(appointmentData: AppointmentFormData): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointmentData)
        .pipe(catchError(this.handleError<Appointment>('createAppointment')));
  }
  updateAppointment(id: string, appointmentData: Partial<AppointmentFormData>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, appointmentData)
        .pipe(catchError(this.handleError<Appointment>('updateAppointment')));
  }
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${id}`)
        .pipe(catchError(this.handleError<any>('deleteAppointment')));
  }
  updateAppointmentStatus(id: string, status: AppointmentStatus['value']): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${id}/status`, { status })
        .pipe(catchError(this.handleError<Appointment>('updateAppointmentStatus')));
  }
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`)
        .pipe(catchError(this.handleError<Service[]>('getServices', [])));
  }
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
        .pipe(catchError(this.handleError<Customer[]>('getCustomers', [])));
  }
  getAvailableTimeSlots(date: string, serviceId: string, staffId?: string): Observable<string[]> {
    let url = `${this.apiUrl}/appointments/available-slots?date=${date}&serviceId=${serviceId}`;
    if (staffId) {
      url += `&staffId=${staffId}`;
    }
    return this.http.get<string[]>(url)
        .pipe(catchError(this.handleError<string[]>('getAvailableTimeSlots', [])));
  }
  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?startDate=${startDate}&endDate=${endDate}`)
        .pipe(catchError(this.handleError<Appointment[]>('getAppointmentsByDateRange', [])));
  }
  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?date=${date}`)
        .pipe(catchError(this.handleError<Appointment[]>('getAppointmentsByDate', [])));
  }

  getAppointmentsByCustomerId(customerId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?customerId=${customerId}`)
        .pipe(catchError(this.handleError<Appointment[]>('getAppointmentsByCustomerId', [])));
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
        .pipe(catchError(this.handleError<Appointment[]>('getUserAppointments', [])));
  }

  /**
   * Get a specific appointment for the current user
   * @param id Appointment ID
   * @returns Observable with appointment details
   */
  getUserAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/user/appointments/${id}`)
        .pipe(catchError(this.handleError<Appointment>('getUserAppointmentById')));
  }

  /**
   * Cancel an appointment for the current user
   * @param id Appointment ID
   * @returns Observable with updated appointment
   */
  cancelUserAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/user/appointments/${id}/cancel`, {})
        .pipe(catchError(this.handleError<Appointment>('cancelUserAppointment')));
  }

  createUserAppointment(appointmentData: Partial<AppointmentFormData>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/user/appointments`, appointmentData)
        .pipe(catchError(this.handleError<Appointment>('createUserAppointment')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}

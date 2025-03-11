// src/app/core/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppointmentsService, Appointment } from './appointments.service';
import { ServicesService, Service } from './services.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private appointmentsService: AppointmentsService,
    private servicesService: ServicesService
  ) {}

  /**
   * Get available services for booking
   * This uses the same service as the admin service management but filters for active services only
   */
  getAvailableServices(): Observable<Service[]> {
    return this.servicesService.getServices().pipe(
      catchError(this.handleError<Service[]>('getAvailableServices', []))
    );
  }

  /**
   * Get available time slots for a specific service and date
   */
  getAvailableTimeSlots(date: string, serviceId: string): Observable<string[]> {
    return this.appointmentsService.getAvailableTimeSlots(date, serviceId).pipe(
      catchError(this.handleError<string[]>('getAvailableTimeSlots', []))
    );
  }

  /**
   * Create a new appointment booking for the current user
   */
  createBooking(bookingData: any): Observable<Appointment> {
    return this.appointmentsService.createUserAppointment(bookingData).pipe(
      catchError(this.handleError<Appointment>('createBooking'))
    );
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
      return of(result as T);
    };
  }
}

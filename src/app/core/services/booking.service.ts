import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppointmentsService, Appointment } from './appointments.service';
import { ServicesService, Service } from './services.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private appointmentsService: AppointmentsService,
    private servicesService: ServicesService,
    private notificationService: NotificationService
  ) {}

  /**
   * Get available services for booking
   * This uses the same service as the admin service management but filters for active services only
   */
  getAvailableServices(): Observable<Service[]> {
    return this.servicesService.getServices().pipe(
      catchError(error => {
        this.notificationService.error('Failed to load available services. Please try again.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get available time slots for a specific service and date
   */
  getAvailableTimeSlots(date: string, serviceId: string): Observable<string[]> {
    return this.appointmentsService.getAvailableTimeSlots(date, serviceId).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load available time slots. Please try again.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new appointment booking for the current user
   */
  createBooking(bookingData: any): Observable<Appointment> {
    return this.appointmentsService.createUserAppointment(bookingData).pipe(
      tap(() => {
        this.notificationService.success('Your appointment has been booked successfully!');
      }),
      catchError(error => {
        this.notificationService.error(`Booking failed. ${error.error?.message || 'Please try again.'}`);
        return throwError(() => error);
      })
    );
  }
}

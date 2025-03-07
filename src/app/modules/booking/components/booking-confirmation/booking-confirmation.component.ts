// src/app/modules/booking/components/booking-confirmation/booking-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html'
})
export class BookingConfirmationComponent implements OnInit {
  appointment: Appointment | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentsService: AppointmentsService
  ) {}

  ngOnInit(): void {
    this.loadAppointment();
  }

  loadAppointment(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Appointment ID is missing';
      this.isLoading = false;
      return;
    }

    this.appointmentsService.getAppointmentById(id).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointment details. Please try again.';
        this.isLoading = false;
        console.error('Error loading appointment:', error);
      }
    });
  }

  viewBookings(): void {
    this.router.navigate(['/dashboard/appointments']);
  }

  bookAnother(): void {
    this.router.navigate(['/dashboard/booking']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  formatEndTime(timeString: string, durationMinutes: number): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10) + durationMinutes);

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
}

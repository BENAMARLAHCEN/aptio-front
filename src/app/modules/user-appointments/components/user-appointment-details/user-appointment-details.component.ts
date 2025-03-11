// src/app/modules/user-appointments/components/user-appointment-details/user-appointment-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-appointment-details',
  templateUrl: './user-appointment-details.component.html'
})
export class UserAppointmentDetailsComponent implements OnInit {
  appointment: Appointment | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentsService: AppointmentsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.currentUserValue?.userId || null;
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

    this.appointmentsService.getUserAppointmentById(id).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 403) {
          this.errorMessage = 'You do not have permission to view this appointment';
        } else {
          this.errorMessage = 'Failed to load appointment details. Please try again.';
        }
        this.isLoading = false;
        console.error('Error loading appointment:', error);
      }
    });
  }

  cancelAppointment(): void {
    if (!this.appointment || !this.isAppointmentCancellable(this.appointment)) {
      return;
    }

    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentsService.updateAppointmentStatus(this.appointment.id, 'cancelled').subscribe({
        next: (updatedAppointment) => {
          this.appointment = updatedAppointment;
        },
        error: (error) => {
          console.error('Error cancelling appointment:', error);
          // Show error notification
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

  isAppointmentCancellable(appointment: Appointment): boolean {
    // Only pending or confirmed appointments can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return false;
    }

    // Check if appointment is in the future
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    return appointmentDate > now;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/my-appointments']);
  }
}

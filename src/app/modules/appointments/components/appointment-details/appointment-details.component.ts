// src/app/modules/appointments/components/appointment-details/appointment-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService, Appointment, AppointmentStatus } from '../../../../core/services/appointments.service';

@Component({
  selector: 'app-appointment-details',
  templateUrl: './appointment-details.component.html'
})
export class AppointmentDetailsComponent implements OnInit {
  appointment: Appointment | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  statusOptions: AppointmentStatus[] = [];
  isUpdatingStatus = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentsService: AppointmentsService
  ) {
    this.statusOptions = this.appointmentsService.statusOptions;
  }

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
        // We'll keep the original dates but create formatted versions for display
        this.appointment = appointment;

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

  editAppointment(): void {
    if (this.appointment) {
      this.router.navigate(['/dashboard/appointments/edit', this.appointment.id]);
    }
  }

  updateStatus(status: AppointmentStatus['value']): void {
    if (!this.appointment) return;

    this.isUpdatingStatus = true;

    this.appointmentsService.updateAppointmentStatus(this.appointment.id, status).subscribe({
      next: (updatedAppointment) => {
        this.appointment = updatedAppointment;
        this.isUpdatingStatus = false;
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.isUpdatingStatus = false;
        // Show error notification
      }
    });
  }

  deleteAppointment(): void {
    if (!this.appointment || !confirm('Are you sure you want to delete this appointment?')) return;

    this.appointmentsService.deleteAppointment(this.appointment.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/appointments']);
      },
      error: (error) => {
        console.error('Error deleting appointment:', error);
        // Show error notification
      }
    });
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
    if (!timeString || typeof timeString !== 'string') {
      return '';
    }

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // Helper method to safely format dates for display
  getFormattedDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  // Helper to check if two dates should be considered different
  areDifferentDates(date1: string, date2: string): boolean {
    if (!date1 || !date2) return false;
    try {
      const d1 = new Date(date1).getTime();
      const d2 = new Date(date2).getTime();
      return d1 !== d2;
    } catch (error) {
      return false;
    }
  }

  formatDateTime(dateString: string, timeString: string): string {
    const date = new Date(dateString);
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatEndTime(timeString: string, durationMinutes: number): string {
    if (!timeString || typeof timeString !== 'string') {
      return '';
    }

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10) + durationMinutes);

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/appointments']);
  }
}

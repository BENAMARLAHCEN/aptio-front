// src/app/modules/user-appointments/components/user-appointments/user-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-appointments',
  templateUrl: './user-appointments.component.html'
})
export class UserAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  userId: string | null = null;

  // Filter state
  statusFilter: string | null = null;

  constructor(
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user ID from auth service
    this.userId = this.authService.currentUserValue?.userId || null;
    if (this.userId) {
      this.loadUserAppointments();
    } else {
      this.errorMessage = 'User information not found. Please log in again.';
      this.isLoading = false;
    }
  }

  loadUserAppointments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.appointmentsService.getUserAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
        console.error('Error loading appointments:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      if (this.statusFilter && appointment.status !== this.statusFilter) {
        return false;
      }
      return true;
    });

    // Sort by date and time, most recent first
    this.filteredAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }

  setStatusFilter(status: string | null): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  viewAppointmentDetails(id: string): void {
    this.router.navigate(['/dashboard/my-appointments', id]);
  }

  cancelAppointment(id: string, event: Event): void {
    event.stopPropagation(); // Prevent row click navigation

    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentsService.updateAppointmentStatus(id, 'cancelled').subscribe({
        next: () => {
          // Update appointment in local array
          const index = this.appointments.findIndex(a => a.id === id);
          if (index !== -1) {
            this.appointments[index].status = 'cancelled';
            this.applyFilters();
          }
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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  formatTime(timeString: string): string {
    if (typeof timeString !== 'string' || !timeString.includes(':')) {
      return '';
    }

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

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
}

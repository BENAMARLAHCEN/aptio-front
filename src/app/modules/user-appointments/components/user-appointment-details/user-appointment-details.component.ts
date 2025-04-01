// src/app/modules/user-appointments/components/user-appointment-details/user-appointment-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { DateUtilService } from '../../../../core/services/date-util.service';

@Component({
  selector: 'app-user-appointment-details',
  templateUrl: './user-appointment-details.component.html'
})
export class UserAppointmentDetailsComponent implements OnInit {
  appointment: Appointment | null = null;
  isLoading = true;
  isCancelling = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentsService: AppointmentsService,
    private dateUtilService: DateUtilService
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

    this.appointmentsService.getUserAppointmentById(id).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointment details:', error);
        this.errorMessage = 'Failed to load appointment details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  cancelAppointment(): void {
    if (!this.appointment || !confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.isCancelling = true;

    this.appointmentsService.cancelUserAppointment(this.appointment.id).subscribe({
      next: (updatedAppointment) => {
        this.appointment = updatedAppointment;
        this.isCancelling = false;
      },
      error: (error) => {
        console.error('Error cancelling appointment:', error);
        this.errorMessage = 'Failed to cancel appointment. Please try again.';
        this.isCancelling = false;
      }
    });
  }

  canCancel(appointment: Appointment | null): boolean {
    if (!appointment) return false;

    // Can cancel if appointment is pending or confirmed and in the future
    const isPendingOrConfirmed = ['pending', 'confirmed'].includes(appointment.status.toLowerCase());

    // Check if appointment is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    const isFuture = appointmentDate >= today;

    return isPendingOrConfirmed && isFuture;
  }

  bookAgain(): void {
    if (this.appointment && this.appointment.serviceId) {
      this.router.navigate(['/dashboard/booking/time', this.appointment.serviceId]);
    } else {
      this.router.navigate(['/dashboard/booking/service']);
    }
  }

  formatDate(dateString: any): string {
    return this.dateUtilService.formatDateMedium(dateString);
  }

  formatDateLong(dateString: string): string {
    return this.dateUtilService.formatDateLong(dateString);
  }

  formatTime(time: any): string {
    return this.dateUtilService.formatTime(time);
  }

  formatEndTime(time: any, durationMinutes: number): string {
    return this.dateUtilService.calculateEndTime(time, durationMinutes);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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

  goBack(): void {
    this.router.navigate(['/dashboard/my-appointments']);
  }
}

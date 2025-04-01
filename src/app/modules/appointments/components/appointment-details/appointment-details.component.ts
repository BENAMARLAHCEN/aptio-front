// src/app/modules/appointments/components/appointment-details/appointment-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService, Appointment, AppointmentStatus } from '../../../../core/services/appointments.service';
import { ConfirmDialogService } from "../../../../core/services/confirm-dialog.service";
import { NotificationService } from "../../../../core/services/notification.service";
import { DateUtilService } from "../../../../core/services/date-util.service";

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
    private appointmentsService: AppointmentsService,
    private confirmDialogService: ConfirmDialogService,
    private notificationService: NotificationService,
    private dateUtilService: DateUtilService
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
      this.notificationService.error('Appointment ID is missing');
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
        this.notificationService.error('Failed to load appointment details. Please try again.');
        this.isLoading = false;
      }
    });
  }

  editAppointment(): void {
    if (this.appointment) {
      this.router.navigate(['/dashboard/appointments/edit', this.appointment.id]);
    }
  }

  async updateStatus(status: AppointmentStatus['value']): Promise<void> {
    if (!this.appointment) return;

    const statusLabel = this.statusOptions.find(s => s.value === status)?.label || status;

    // Get confirmation before updating status
    const confirmResult = await this.confirmDialogService.confirmStatusChange(
      status,
      statusLabel,
      'appointment'
    );

    if (!confirmResult) return;

    this.isUpdatingStatus = true;

    this.appointmentsService.updateAppointmentStatus(this.appointment.id, status).subscribe({
      next: (updatedAppointment) => {
        this.appointment = updatedAppointment;
        this.isUpdatingStatus = false;
      },
      error: (error) => {
        this.isUpdatingStatus = false;
        this.notificationService.error(`Failed to update appointment status: ${error.error?.message || 'Please try again'}`);
      }
    });
  }

  async deleteAppointment(): Promise<void> {
    if (!this.appointment) return;

    const result = await this.confirmDialogService.confirmDelete('appointment');

    if (!result) return;

    this.appointmentsService.deleteAppointment(this.appointment.id).subscribe({
      next: () => {
        // Notification is already handled in the service
        this.router.navigate(['/dashboard/appointments']);
      },
      error: (error) => {
        // Keep error notification as fallback
        this.notificationService.error(`Failed to delete appointment: ${error.error?.message || 'Please try again'}`);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return this.dateUtilService.formatDateLong(dateString);
  }

  formatTime(time: any): string {
    return this.dateUtilService.formatTime(time);
  }

  // Helper method to safely format dates for display
  getFormattedDate(dateString: any): string {
    if (!dateString) return 'Unknown';
    return this.dateUtilService.formatDateMedium(dateString);
  }

  // Helper to check if two dates should be considered different
  areDifferentDates(date1: any, date2: any): boolean {
    if (!date1 || !date2) return false;

    try {
      const d1 = new Date(date1).getTime();
      const d2 = new Date(date2).getTime();
      return d1 !== d2;
    } catch (error) {
      return false;
    }
  }

  formatEndTime(time: any, durationMinutes: number): string {
    return this.dateUtilService.calculateEndTime(time, durationMinutes);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/appointments']);
  }
}

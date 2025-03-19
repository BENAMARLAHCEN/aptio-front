// src/app/modules/appointments/components/appointments-list/appointments-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentsService, Appointment, AppointmentStatus } from '../../../../core/services/appointments.service';
import {NotificationService} from "../../../../core/services/notification.service";

interface FilterOptions {
  status: string | null;
  date: string | null;
  search: string;
}

@Component({
  selector: 'app-appointments-list',
  templateUrl: './appointments-list.component.html'
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Filtering options
  filterOptions: FilterOptions = {
    status: null,
    date: null,
    search: ''
  };

  // Status options for filtering
  statusOptions: AppointmentStatus[] = [];

  // Unique dates from appointments for date filter
  dateOptions: string[] = [];

  constructor(
    private appointmentsService: AppointmentsService,
    private router: Router,
    private notificationHelper: NotificationService
  ) {
    this.statusOptions = this.appointmentsService.statusOptions;
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.appointmentsService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.extractDateOptions();
        this.applyFilters();
        this.isLoading = false;
        this.notificationHelper.loadedItems('appointments', appointments.length);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
        console.error('Error loading appointments:', error);
        this.notificationHelper.loadFailed('appointments');
      }
    });
  }

  extractDateOptions(): void {
    // Extract unique dates from appointments
    const uniqueDates = new Set<string>();
    this.appointments.forEach(appointment => {
      uniqueDates.add(appointment.date);
    });

    this.dateOptions = Array.from(uniqueDates).sort();
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      // Status filter
      if (this.filterOptions.status && appointment.status !== this.filterOptions.status) {
        return false;
      }

      // Date filter
      if (this.filterOptions.date && appointment.date !== this.filterOptions.date) {
        return false;
      }

      // Search filter (case-insensitive)
      if (this.filterOptions.search) {
        const searchLower = this.filterOptions.search.toLowerCase();
        return appointment.customerName.toLowerCase().includes(searchLower) ||
          appointment.serviceName.toLowerCase().includes(searchLower) ||
          (appointment.notes && appointment.notes.toLowerCase().includes(searchLower));
      }

      return true;
    });

    // Notify about filter results
    if (this.filterOptions.status || this.filterOptions.date || this.filterOptions.search) {
      const filterCount = this.filteredAppointments.length;
      const totalCount = this.appointments.length;

      if (filterCount === 0) {
        this.notificationHelper.info('No appointments match the current filters.');
      } else {
        this.notificationHelper.info(`Showing ${filterCount} of ${totalCount} appointments.`);
      }
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterOptions = {
      status: null,
      date: null,
      search: ''
    };
    this.applyFilters();
    this.notificationHelper.info('Filters cleared.');
  }

  viewAppointmentDetails(id: string): void {
    this.router.navigate(['/dashboard/appointments', id]);
  }

  editAppointment(id: string, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing
    this.router.navigate(['/dashboard/appointments/edit', id]);
  }

  createAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
    this.notificationHelper.info('Creating a new appointment');
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
    if (typeof timeString !== 'string') {
      return '';
    }

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus['value'], event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing

    this.appointmentsService.updateAppointmentStatus(id, status).subscribe({
      next: () => {
        const index = this.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
          this.appointments[index].status = status;
          this.applyFilters();

          // Show success notification
          const statusLabel = this.statusOptions.find(s => s.value === status)?.label || status;
          this.notificationHelper.success(`Appointment status updated to ${statusLabel}`);
        }
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.notificationHelper.error(`Failed to update appointment status. Please try again.`);
      }
    });
  }
}

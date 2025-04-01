// src/app/modules/appointments/components/appointments-list/appointments-list.component.ts
  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { AppointmentsService, Appointment, AppointmentStatus } from '../../../../core/services/appointments.service';
  import { NotificationService } from '../../../../core/services/notification.service';
  import { DateUtilService } from '../../../../core/services/date-util.service';

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
      private notificationHelper: NotificationService,
      private dateUtilService: DateUtilService
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
        if (this.filterOptions.status && appointment.status.toLowerCase() !== this.filterOptions.status) {
          return false;
        }

        // Date filter
        if (this.filterOptions.date && appointment.date.toString() !== this.filterOptions.date) {
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
      return this.dateUtilService.formatDateMedium(dateString);
    }

    formatTime(timeString: string): string {
      return this.dateUtilService.formatTime(timeString);
    }

    updateAppointmentStatus(id: string, status: AppointmentStatus['value'], event: Event): void {
      event.stopPropagation(); // Prevent the parent click event from firing

      this.appointmentsService.updateAppointmentStatus(id, status).subscribe({
        next: () => {
          const index = this.appointments.findIndex(a => a.id === id);
          if (index !== -1) {
            this.appointments[index].status = status;
            this.applyFilters();

          }
        },
        error: (error) => {
          this.notificationHelper.error(`Failed to update appointment status. Please try again.`,error);
        }
      });
    }
  }

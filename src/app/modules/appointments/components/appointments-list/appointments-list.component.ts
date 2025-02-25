// src/app/modules/appointments/components/appointments-list/appointments-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentsService, Appointment, AppointmentStatus } from '../../../../core/services/appointments.service';

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
    private router: Router
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

    // Sort by date and time
    this.filteredAppointments.sort((a, b) => {
      // Sort by date first
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // Then by time
      return a.time.localeCompare(b.time);
    });
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
        }
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        // Show error notification
      }
    });
  }
}

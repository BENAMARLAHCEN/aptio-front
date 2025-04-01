// src/app/modules/user-appointments/components/user-appointments-list/user-appointments-list.component.ts
  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
  import { DateUtilService } from '../../../../core/services/date-util.service';

  @Component({
    selector: 'app-user-appointments-list',
    templateUrl: './user-appointments-list.component.html'
  })
  export class UserAppointmentsListComponent implements OnInit {
    appointments: Appointment[] = [];
    filteredAppointments: Appointment[] = [];
    activeFilter: 'upcoming' | 'past' | 'cancelled' = 'upcoming';

    isLoading = true;
    errorMessage: string | null = null;

    constructor(
      private appointmentsService: AppointmentsService,
      private router: Router,
      private dateUtilService: DateUtilService
    ) {}

    ngOnInit(): void {
      this.loadAppointments();
    }

    loadAppointments(): void {
      this.isLoading = true;
      this.errorMessage = null;

      this.appointmentsService.getUserAppointments().subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.filterAppointments(this.activeFilter);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.errorMessage = 'Failed to load appointments. Please try again.';
          this.isLoading = false;
        }
      });
    }

    filterAppointments(filter: 'upcoming' | 'past' | 'cancelled'): void {
      this.activeFilter = filter;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filter) {
        case 'upcoming':
          this.filteredAppointments = this.appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return (
              appointmentDate >= today &&
              appointment.status !== 'cancelled' &&
              appointment.status !== 'completed'
            );
          });
          break;

        case 'past':
          this.filteredAppointments = this.appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return (
              appointmentDate < today ||
              appointment.status === 'completed'
            ) && appointment.status !== 'cancelled';
          });
          break;

        case 'cancelled':
          this.filteredAppointments = this.appointments.filter(appointment =>
            appointment.status.toLowerCase() === 'cancelled'
          );
          break;
      }

      // Sort by date/time
      this.filteredAppointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA.getTime() !== dateB.getTime()) {
          // If upcoming, show nearest first; if past, show most recent first
          return filter === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        }

        // Sort by time if same date
        const timeA = this.dateUtilService.parseTime(a.time);
        const timeB = this.dateUtilService.parseTime(b.time);
        return timeA - timeB;
      });
    }

    formatDateTime(dateString: string, time: any): string {
      return this.dateUtilService.formatDateTime(dateString, time);
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

    viewAppointmentDetails(appointment: Appointment): void {
      this.router.navigate(['/dashboard/my-appointments', appointment.id]);
    }
  }

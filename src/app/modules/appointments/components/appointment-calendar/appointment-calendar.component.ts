// src/app/modules/appointments/components/appointment-calendar/appointment-calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentsService, Appointment, AppointmentStatus } from '../../../../core/services/appointments.service';

interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

interface Week {
  days: Day[];
}

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html'
})
export class AppointmentCalendarComponent implements OnInit {
  appointments: Appointment[] = [];
  weeks: Week[] = [];
  currentMonth: Date = new Date();
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  isLoading = true;
  errorMessage: string | null = null;
  statusOptions: AppointmentStatus[] = [];

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
        this.generateCalendar();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
        console.error('Error loading appointments:', error);
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the first day of the week that includes the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on the last day of the week that includes the last day of the month
    const endDate = new Date(lastDay);
    if (endDate.getDay() < 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate weeks and days
    this.weeks = [];
    let currentWeek: Week = { days: [] };

    // Loop through days from start to end date
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // For each day, check if it has appointments
      const dayAppointments = this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getFullYear() === currentDate.getFullYear() &&
          appointmentDate.getMonth() === currentDate.getMonth() &&
          appointmentDate.getDate() === currentDate.getDate()
        );
      });

      // Add day to the current week
      currentWeek.days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.getTime() === today.getTime(),
        appointments: dayAppointments
      });

      // If we completed a week, add it to weeks array and start a new week
      if (currentDate.getDay() === 6) {
        this.weeks.push(currentWeek);
        currentWeek = { days: [] };
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add the last week if it has any days
    if (currentWeek.days.length > 0) {
      this.weeks.push(currentWeek);
    }
  }

  prevMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  viewAppointmentDetails(id: string): void {
    this.router.navigate(['/dashboard/appointments', id]);
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

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  getDayClass(day: Day): string {
    let classes = 'p-1 sm:p-2 border border-neutral-light hover:bg-neutral-light';

    if (day.isToday) {
      classes += ' bg-primary-light border-primary';
    } else if (!day.isCurrentMonth) {
      classes += ' bg-neutral-light/50 text-neutral';
    }

    return classes;
  }
}


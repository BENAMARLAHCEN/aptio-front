// src/app/modules/dashboard/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';

interface StatsCard {
  title: string;
  value: string;
  icon: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  // Stats cards data
  statsCards: StatsCard[] = [];

  // Upcoming appointments
  upcomingAppointments: Appointment[] = [];

  // Loading states
  isLoadingStats = true;
  isLoadingAppointments = true;

  // Error states
  statsError: string | null = null;
  appointmentsError: string | null = null;

  // Current date
  currentDate = new Date();

  constructor(
    private dashboardService: DashboardService,
    private appointmentsService: AppointmentsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoadingStats = true;
    this.isLoadingAppointments = true;

    // Load dashboard stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.statsCards = [
          {
            title: 'Total Appointments',
            value: stats.totalAppointments.toString(),
            icon: 'calendar_today',
            changeType: 'increase'
          },
          {
            title: 'New Customers',
            value: stats.newCustomers.toString(),
            icon: 'people',
            changeType: 'increase'
          },
          {
            title: 'Utilization Rate',
            value: `${stats.utilizationRate}%`,
            icon: 'bar_chart',
            changeType: 'decrease'
          },
          {
            title: 'Average Feedback',
            value: `${stats.averageFeedback}/5`,
            icon: 'star',
            changeType: 'neutral'
          }
        ];
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.statsError = 'Failed to load dashboard stats. Please try again.';
        this.isLoadingStats = false;
      }
    });

    // Load upcoming appointments
    this.loadUpcomingAppointments();
  }

  loadUpcomingAppointments(): void {
    this.appointmentsService.getAppointments().subscribe({
      next: (appointments) => {
        // Filter upcoming appointments (today and future dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.upcomingAppointments = appointments
          .filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate >= today && appointment.status !== 'cancelled';
          })
          .sort((a, b) => {
            // Sort by date and time
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5); // Get just the next 5 appointments

        this.isLoadingAppointments = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.appointmentsError = 'Failed to load appointments. Please try again.';
        this.isLoadingAppointments = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      case 'completed':
        return 'badge-info';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  formatTime(timeString: any): string {
    // Add type check to handle different time formats
    if (!timeString) return '';

    let hours: number;
    let minutes: number;

    if (typeof timeString === 'string' && timeString.includes(':')) {
      // Handle string format like "14:30"
      [hours, minutes] = timeString.split(':').map(Number);
    } else if (timeString instanceof Date) {
      // Handle Date object
      hours = timeString.getHours();
      minutes = timeString.getMinutes();
    } else {
      // If timeString is in an unexpected format, return it as is or empty string
      return String(timeString || '');
    }

    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
}

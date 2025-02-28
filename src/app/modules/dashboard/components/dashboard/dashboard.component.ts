// src/app/modules/dashboard/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { forkJoin } from 'rxjs';

interface StatsCard {
  title: string;
  value: string;
  change: string;
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
    private appointmentsService: AppointmentsService,
    private router: Router
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
            change: '+12% from last month',
            icon: 'calendar_today',
            changeType: 'increase'
          },
          {
            title: 'New Customers',
            value: stats.newCustomers.toString(),
            change: '+24% from last month',
            icon: 'people',
            changeType: 'increase'
          },
          {
            title: 'Utilization Rate',
            value: `${stats.utilizationRate}%`,
            change: '-3% from last month',
            icon: 'bar_chart',
            changeType: 'decrease'
          },
          {
            title: 'Average Feedback',
            value: `${stats.averageFeedback}/5`,
            change: 'Same as last month',
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

        // Fallback to mock data
        this.loadMockStatsData();
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

        // Fallback to mock data
        this.loadMockAppointmentData();
      }
    });
  }

  // Fallback methods to load mock data if API calls fail
  private loadMockStatsData(): void {
    this.statsCards = [
      {
        title: 'Total Appointments',
        value: '256',
        change: '+12% from last month',
        icon: 'calendar_today',
        changeType: 'increase'
      },
      {
        title: 'New Customers',
        value: '32',
        change: '+24% from last month',
        icon: 'people',
        changeType: 'increase'
      },
      {
        title: 'Utilization Rate',
        value: '68%',
        change: '-3% from last month',
        icon: 'bar_chart',
        changeType: 'decrease'
      },
      {
        title: 'Average Feedback',
        value: '4.8/5',
        change: 'Same as last month',
        icon: 'star',
        changeType: 'neutral'
      }
    ];
  }

  private loadMockAppointmentData(): void {
    // Mock upcoming appointments
    this.upcomingAppointments = [
      {
        id: '1',
        customerId: '101',
        customerName: 'John Doe',
        serviceId: '201',
        serviceName: 'Haircut',
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        duration: 30,
        status: 'confirmed',
        price: 35,
        notes: 'Regular customer, prefers quick service',
        createdAt: '2025-02-20T10:00:00Z',
        updatedAt: '2025-02-20T10:00:00Z'
      },
      {
        id: '2',
        customerId: '102',
        customerName: 'Jane Smith',
        serviceId: '202',
        serviceName: 'Manicure',
        date: new Date().toISOString().split('T')[0],
        time: '16:00',
        duration: 45,
        status: 'pending',
        price: 25,
        createdAt: '2025-02-21T09:15:00Z',
        updatedAt: '2025-02-21T09:15:00Z'
      },
      {
        id: '3',
        customerId: '103',
        customerName: 'Mike Johnson',
        serviceId: '203',
        serviceName: 'Massage',
        date: this.getNextDay(1),
        time: '10:15',
        duration: 60,
        status: 'confirmed',
        price: 70,
        notes: 'Back pain issues, gentle pressure',
        createdAt: '2025-02-22T14:30:00Z',
        updatedAt: '2025-02-22T14:30:00Z'
      }
    ] as Appointment[];
  }

  // Helper methods
  getNextDay(daysToAdd: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
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

  formatTime(timeString: string): string {
    if (typeof timeString !== 'string' || !timeString.includes(':')) {
      console.error('Invalid timeString:', timeString);
      return '';
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  createAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
  }

  viewAllAppointments(): void {
    this.router.navigate(['/dashboard/appointments']);
  }
}

import { Component } from '@angular/core';

interface StatsCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

interface Appointment {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  // Sample data - this would normally come from a service
  statsCards: StatsCard[] = [
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

  upcomingAppointments: Appointment[] = [
    {
      id: 1,
      customerName: 'John Doe',
      service: 'Haircut',
      date: 'Today',
      time: '2:30 PM',
      status: 'confirmed'
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      service: 'Manicure',
      date: 'Today',
      time: '4:00 PM',
      status: 'pending'
    },
    {
      id: 3,
      customerName: 'Mike Johnson',
      service: 'Massage',
      date: 'Tomorrow',
      time: '10:15 AM',
      status: 'confirmed'
    },
    {
      id: 4,
      customerName: 'Sarah Williams',
      service: 'Facial',
      date: 'Tomorrow',
      time: '11:30 AM',
      status: 'confirmed'
    },
    {
      id: 5,
      customerName: 'Robert Brown',
      service: 'Consultation',
      date: 'Feb 27',
      time: '3:45 PM',
      status: 'cancelled'
    }
  ];

  getStatusClass(status: string): string {
    switch(status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return '';
    }
  }
}

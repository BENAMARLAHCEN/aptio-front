import { Component, Input } from '@angular/core';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() isOpen: boolean = true;

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'calendar_today', label: 'Appointments', route: '/dashboard/appointments', badge: 3 },
    { icon: 'schedule', label: 'Schedule', route: '/dashboard/schedule' },
    { icon: 'people', label: 'Customers', route: '/dashboard/customers' },
    { icon: 'assignment', label: 'Services', route: '/dashboard/services' },
    { icon: 'bar_chart', label: 'Reports', route: '/dashboard/reports' }
  ];

  settingsItems: NavItem[] = [
    { icon: 'person', label: 'Profile', route: '/dashboard/profile' },
    { icon: 'settings', label: 'Settings', route: '/dashboard/settings' },
    { icon: 'help', label: 'Help', route: '/dashboard/help' }
  ];
}

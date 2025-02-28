// src/app/modules/dashboard/components/sidebar/sidebar.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  roles?: string[]; // Optional roles required to see this menu item
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  @Input() isOpen: boolean = true;

  allNavItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    {
      icon: 'calendar_today',
      label: 'Appointments',
      route: '/dashboard/appointments',
      badge: 3,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      icon: 'schedule',
      label: 'Schedule',
      route: '/dashboard/schedule',
      roles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      icon: 'people',
      label: 'Customers',
      route: '/dashboard/customers',
      roles: ['ROLE_ADMIN', 'ROLE_STAFF']
    },
    {
      icon: 'groups',
      label: 'Staff',
      route: '/dashboard/staff',
      roles: ['ROLE_ADMIN']
    },
    {
      icon: 'event_note',
      label: 'My Appointments',
      route: '/dashboard/my-appointments',
      roles: ['ROLE_USER']
    },
    {
      icon: 'assignment',
      label: 'Services',
      route: '/dashboard/services',
      roles: ['ROLE_ADMIN']
    },
    {
      icon: 'bar_chart',
      label: 'Reports',
      route: '/dashboard/reports',
      roles: ['ROLE_ADMIN']
    }
  ];

  allSettingsItems: NavItem[] = [
    { icon: 'person', label: 'Profile', route: '/dashboard/profile' },
    {
      icon: 'settings',
      label: 'Settings',
      route: '/dashboard/settings',
      roles: ['ROLE_ADMIN']
    },
    { icon: 'help', label: 'Help', route: '/dashboard/help' }
  ];

  // Filtered nav items based on user roles
  navItems: NavItem[] = [];
  settingsItems: NavItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.filterNavItems();
  }

  filterNavItems(): void {
    this.navItems = this.allNavItems.filter(item => {
      // If no roles specified, everyone can see it
      if (!item.roles || item.roles.length === 0) {
        return true;
      }

      // Check if user has any of the required roles
      return item.roles.some(role => this.authService.hasRole(role));
    });

    this.settingsItems = this.allSettingsItems.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }

      return item.roles.some(role => this.authService.hasRole(role));
    });
  }
}

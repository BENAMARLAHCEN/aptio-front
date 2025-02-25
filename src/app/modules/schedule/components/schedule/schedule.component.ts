// src/app/modules/schedule/components/schedule/schedule.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html'
})
export class ScheduleComponent {
  navItems: NavItem[] = [
    { label: 'Daily View', route: '/dashboard/schedule/daily', icon: 'today' },
    { label: 'Weekly View', route: '/dashboard/schedule/weekly', icon: 'view_week' },
    { label: 'Resources', route: '/dashboard/schedule/resources', icon: 'meeting_room' },
    { label: 'Settings', route: '/dashboard/schedule/settings', icon: 'settings' }
  ];

  constructor(private router: Router) {}

  // Returns true if the given route is active
  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}

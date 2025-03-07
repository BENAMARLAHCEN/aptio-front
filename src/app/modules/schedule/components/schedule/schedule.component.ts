// src/app/modules/schedule/components/schedule/schedule.component.ts
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
    { label: 'Weekly View', route: '/dashboard/schedule/weekly', icon: 'view_week' }
  ];

  activeRoute: string = '';

  constructor(private router: Router) {
    // Keep track of current route for active tab styling
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.activeRoute = event.url;
    });

    // Set initial active route
    this.activeRoute = this.router.url;
  }

  isActive(route: string): boolean {
    return this.activeRoute === route;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}

// src/app/modules/landing/components/landing-layout/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  login(): void {
    this.router.navigate(['/auth/login']);
  }

  register(): void {
    this.router.navigate(['/auth/register']);
  }

  dashboard(): void {
    // Use the getHomeRouteBasedOnRole method to navigate to the appropriate dashboard
    const homeRoute = this.authService.getHomeRouteBasedOnRole();
    this.router.navigate([homeRoute]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

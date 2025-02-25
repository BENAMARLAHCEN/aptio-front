// src/app/modules/landing/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService, Service } from '../../../../core/services/services.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  featuredServices: Service[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private servicesService: ServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedServices();
  }

  loadFeaturedServices(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.servicesService.getServices().subscribe({
      next: (services) => {
        // Filter for active services and take the first 3 for featured display
        this.featuredServices = services
          .filter(service => service.active)
          .slice(0, 3);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load services. Please try again.';
        this.isLoading = false;
        console.error('Error loading services:', error);
      }
    });
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
  }

  navigateToBooking(): void {
    this.router.navigate(['/booking']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  }
}

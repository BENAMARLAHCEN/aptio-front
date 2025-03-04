// src/app/modules/landing/components/service-details/service-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService, Service } from '../../../../core/services/services.service';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html'
})
export class ServiceDetailsComponent implements OnInit {
  service: Service | null = null;
  relatedServices: Service[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService
  ) {}

  ngOnInit(): void {
    this.loadService();
  }

  loadService(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Service ID is missing';
      this.isLoading = false;
      return;
    }

    this.servicesService.getServiceById(id).subscribe({
      next: (service) => {
        this.service = service;
        this.loadRelatedServices(service.category, service.id);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load service details. Please try again.';
        this.isLoading = false;
        console.error('Error loading service:', error);
      }
    });
  }

  loadRelatedServices(category: string, currentId: string): void {
    this.servicesService.getServices().subscribe({
      next: (services) => {
        // Get up to 3 related services from the same category (excluding current one)
        this.relatedServices = services
          .filter(service => service.category === category && service.id !== currentId && service.active)
          .slice(0, 3);
        this.isLoading = false;
      },
      error: (error) => {
        // Still show the main service even if related services fail to load
        this.isLoading = false;
        console.error('Error loading related services:', error);
      }
    });
  }

  navigateToService(id: string): void {
    this.router.navigate(['/services', id]);
  }

  navigateToBooking(): void {
    if (this.service) {
      this.router.navigate(['/booking'], {
        queryParams: { serviceId: this.service.id }
      });
    } else {
      this.router.navigate(['/booking']);
    }
  }

  goBack(): void {
    this.router.navigate(['/services']);
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
      return `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }

    return hours === 1
      ? `1 hour ${remainingMinutes} minutes`
      : `${hours} hours ${remainingMinutes} minutes`;
  }
}

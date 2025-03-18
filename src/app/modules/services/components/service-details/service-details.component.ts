// src/app/modules/services/components/service-details/service-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService, Service } from '../../../../core/services/services.service';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html'
})
export class ServiceDetailsComponent implements OnInit {
  service: Service | null = null;
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
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load service details. Please try again.';
        this.isLoading = false;
        console.error('Error loading service:', error);
      }
    });
  }

  editService(): void {
    if (this.service) {
      this.router.navigate(['/dashboard/services/edit', this.service.id]);
    }
  }

  toggleServiceStatus(): void {
    if (!this.service) return;

    // Toggle the current active status (pass the opposite of current status)
    this.servicesService.toggleServiceStatus(this.service.id, !this.service.active).subscribe({
      next: (updatedService) => {
        this.service = updatedService;
      },
      error: (error) => {
        console.error('Error toggling service status:', error);
        // Show error notification
      }
    });
  }

  deleteService(): void {
    if (!this.service || !confirm('Are you sure you want to delete this service?')) return;

    this.servicesService.deleteService(this.service.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/services']);
      },
      error: (error) => {
        console.error('Error deleting service:', error);
        // Show error notification
      }
    });
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
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

  goBack(): void {
    this.router.navigate(['/dashboard/services']);
  }
}

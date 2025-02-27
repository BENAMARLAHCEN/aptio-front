// src/app/modules/landing/components/service-list/service-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService, Service, ServiceCategory } from '../../../../core/services/services.service';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html'
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories: ServiceCategory[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Filter state
  searchTerm = '';
  selectedCategory: string | null = null;

  constructor(
    private servicesService: ServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Load categories and services
    this.servicesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(category => category.active);

        this.servicesService.getServices().subscribe({
          next: (services) => {
            // Show only active services
            this.services = services.filter(service => service.active);
            this.applyFilters();
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = 'Failed to load services. Please try again.';
            this.isLoading = false;
            console.error('Error loading services:', error);
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.isLoading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredServices = this.services.filter(service => {
      // Category filter
      if (this.selectedCategory && service.category !== this.selectedCategory) {
        return false;
      }

      // Search filter (case-insensitive)
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return service.name.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower);
      }

      return true;
    });

    // Sort by name
    this.filteredServices.sort((a, b) => a.name.localeCompare(b.name));
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  selectCategory(category: string | null): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.applyFilters();
  }

  viewServiceDetails(id: string): void {
    this.router.navigate(['/services', id]);
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
  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    // If empty string, pass null, otherwise pass the value
    this.selectCategory(value === '' ? null : value);
  }
}

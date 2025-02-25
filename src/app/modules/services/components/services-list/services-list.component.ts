// src/app/modules/services/components/services-list/services-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService, Service, ServiceCategory } from '../../../../core/services/services.service';

interface FilterOptions {
  category: string | null;
  status: boolean | null;
  search: string;
}

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html'
})
export class ServicesListComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories: ServiceCategory[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // View mode (grid or list)
  viewMode: 'grid' | 'list' = 'grid';

  // Filtering options
  filterOptions: FilterOptions = {
    category: null,
    status: null,
    search: ''
  };

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
        this.categories = categories;

        this.servicesService.getServices().subscribe({
          next: (services) => {
            this.services = services;
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
      if (this.filterOptions.category && service.category !== this.filterOptions.category) {
        return false;
      }

      // Status filter
      if (this.filterOptions.status !== null && service.active !== this.filterOptions.status) {
        return false;
      }

      // Search filter (case-insensitive)
      if (this.filterOptions.search) {
        const searchLower = this.filterOptions.search.toLowerCase();
        return service.name.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower);
      }

      return true;
    });

    // Sort by name
    this.filteredServices.sort((a, b) => a.name.localeCompare(b.name));
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterOptions = {
      category: null,
      status: null,
      search: ''
    };
    this.applyFilters();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  viewServiceDetails(id: string): void {
    this.router.navigate(['/dashboard/services', id]);
  }

  editService(id: string, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing
    this.router.navigate(['/dashboard/services/edit', id]);
  }

  createService(): void {
    this.router.navigate(['/dashboard/services/new']);
  }

  toggleServiceStatus(id: string, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing

    this.servicesService.toggleServiceStatus(id).subscribe({
      next: (updatedService) => {
        // Update service in local array
        const index = this.services.findIndex(s => s.id === id);
        if (index !== -1) {
          this.services[index] = updatedService;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error toggling service status:', error);
        // Show error notification
      }
    });
  }

  deleteService(id: string, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing

    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    this.servicesService.deleteService(id).subscribe({
      next: () => {
        // Remove service from local array
        this.services = this.services.filter(s => s.id !== id);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error deleting service:', error);
        // Show error notification
      }
    });
  }

  manageCategories(): void {
    this.router.navigate(['/dashboard/services/categories']);
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
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

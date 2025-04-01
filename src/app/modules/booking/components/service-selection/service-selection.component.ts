// src/app/modules/booking/components/service-selection/service-selection.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService, Service, ServiceCategory } from '../../../../core/services/services.service';

@Component({
  selector: 'app-service-selection',
  templateUrl: './service-selection.component.html'
})
export class ServiceSelectionComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories: ServiceCategory[] = [];
  selectedCategory: string | null = null;
  searchQuery = '';

  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private servicesService: ServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadCategories();
  }

  loadServices(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.servicesService.getServices().subscribe({
      next: (services) => {
        // Only show active services
        this.services = services.filter(service => service.active);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.errorMessage = 'Failed to load services. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.servicesService.getCategories().subscribe({
      next: (categories) => {
        // Only show active categories
        this.categories = categories.filter(category => category.active);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  filterByCategory(categoryName: string | null): void {
    this.selectedCategory = categoryName;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.services;

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(service => service.category === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const searchLower = this.searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }

    this.filteredServices = filtered;
  }

  selectService(service: Service): void {
    this.router.navigate(['/dashboard/booking/time', service.id]);
  }
}

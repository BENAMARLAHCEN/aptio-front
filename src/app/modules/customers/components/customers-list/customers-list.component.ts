// src/app/modules/customers/components/customers-list/customers-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomersService, Customer } from '../../../../core/services/customers.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html'
})
export class CustomersListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Search and filter state
  searchTerm = '';
  searchTerms = new Subject<string>();
  activeFilter: 'all' | 'active' | 'inactive' = 'all';
  sortBy: 'name' | 'email' | 'visits' | 'spent' | 'lastVisit' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private customersService: CustomersService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCustomers();

    // Setup search with debounce
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.customersService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customers. Please try again.';
        this.isLoading = false;
        console.error('Error loading customers:', error);
      }
    });
  }

  applyFilters(): void {
    // First filter by active status
    let result = this.customers;

    if (this.activeFilter !== 'all') {
      const isActive = this.activeFilter === 'active';
      result = result.filter(customer => customer.active === isActive);
    }

    // Then filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(customer =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(this.searchTerm)
      );
    }

    // Sort results
    result = this.sortCustomers(result);

    this.filteredCustomers = result;
  }

  sortCustomers(customers: Customer[]): Customer[] {
    return [...customers].sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'visits':
          comparison = a.totalVisits - b.totalVisits;
          break;
        case 'spent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'lastVisit':
          // Handle null last visit dates
          if (!a.lastVisit && !b.lastVisit) comparison = 0;
          else if (!a.lastVisit) comparison = 1;
          else if (!b.lastVisit) comparison = -1;
          else comparison = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerms.next(target.value);
  }

  setActiveFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  setSorting(sortBy: 'name' | 'email' | 'visits' | 'spent' | 'lastVisit'): void {
    if (this.sortBy === sortBy) {
      // Toggle direction if already sorting by this field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field and default to ascending
      this.sortBy = sortBy;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  viewCustomerDetails(id: string): void {
    this.router.navigate(['/dashboard/customers', id]);
  }

  createCustomer(): void {
    this.router.navigate(['/dashboard/customers/new']);
  }

  editCustomer(id: string, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing
    this.router.navigate(['/dashboard/customers/edit', id]);
  }

  toggleCustomerStatus(id: string, active: boolean, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing

    this.customersService.toggleCustomerStatus(id, !active).subscribe({
      next: (updatedCustomer) => {
        // Update the customer in the local array
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customers[index] = updatedCustomer;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error updating customer status:', error);
        // Show error notification
      }
    });
  }

  getFullName(customer: Customer): string {
    return `${customer.firstName} ${customer.lastName}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
}

// src/app/modules/customers/components/customer-details/customer-details.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService, Customer, CustomerNote } from '../../../../core/services/customers.service';
import { AppointmentsService } from '../../../../core/services/appointments.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html'
})
export class CustomerDetailsComponent implements OnInit {
  customer: Customer | null = null;
  appointments: any[] = [];
  isLoading = true;
  isLoadingAppointments = true;
  errorMessage: string | null = null;

  // For adding notes
  noteForm: FormGroup;
  isAddingNote = false;

  // Active tab
  activeTab: 'details' | 'appointments' | 'notes' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private customersService: CustomersService,
    private appointmentsService: AppointmentsService
  ) {
    this.noteForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCustomer();
  }

  loadCustomer(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Customer ID is missing';
      this.isLoading = false;
      return;
    }

    this.customersService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.isLoading = false;
        this.loadCustomerAppointments(id);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customer details. Please try again.';
        this.isLoading = false;
        console.error('Error loading customer:', error);
      }
    });
  }

  loadCustomerAppointments(customerId: string): void {
    this.isLoadingAppointments = true;

    // Assuming we have a method to get customer appointments
    this.appointmentsService.getAppointments().subscribe({
      next: (appointments) => {
        // Filter appointments for this customer
        this.appointments = appointments.filter(a => a.customerId === customerId);
        this.isLoadingAppointments = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoadingAppointments = false;
      }
    });
  }

  editCustomer(): void {
    if (this.customer) {
      this.router.navigate(['/dashboard/customers/edit', this.customer.id]);
    }
  }

  toggleCustomerStatus(): void {
    if (!this.customer) return;

    this.customersService.toggleCustomerStatus(this.customer.id, !this.customer.active).subscribe({
      next: (updatedCustomer) => {
        this.customer = updatedCustomer;
      },
      error: (error) => {
        console.error('Error updating customer status:', error);
        // Show error notification
      }
    });
  }

  deleteCustomer(): void {
    if (!this.customer || !confirm('Are you sure you want to delete this customer?')) return;

    this.customersService.deleteCustomer(this.customer.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/customers']);
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        // Show error notification
      }
    });
  }

  addNote(): void {
    if (!this.customer || !this.noteForm.valid) return;

    this.isAddingNote = true;

    this.customersService.addCustomerNote(this.customer.id, this.noteForm.value.content).subscribe({
      next: (newNote) => {
        // Add the new note to the customer's notes
        if (!this.customer!.notes) {
          this.customer!.notes = [];
        }
        this.customer!.notes.push(newNote);

        // Reset form
        this.noteForm.reset();
        this.isAddingNote = false;
      },
      error: (error) => {
        console.error('Error adding note:', error);
        this.isAddingNote = false;
        // Show error notification
      }
    });
  }

  createAppointment(): void {
    if (this.customer) {
      // Navigate to new appointment form with customer ID pre-filled
      this.router.navigate(['/dashboard/appointments/new'], {
        queryParams: { customerId: this.customer.id }
      });
    }
  }

  setActiveTab(tab: 'details' | 'appointments' | 'notes'): void {
    this.activeTab = tab;
  }

  getFullName(): string {
    if (!this.customer) return '';
    return `${this.customer.firstName} ${this.customer.lastName}`;
  }

  getFullAddress(): string {
    if (!this.customer || !this.customer.address) return 'Not provided';

    const addr = this.customer.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  formatDateTime(dateString: string, timeString: string): string {
    const date = new Date(dateString);
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/customers']);
  }
}

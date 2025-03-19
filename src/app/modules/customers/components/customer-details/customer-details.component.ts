// src/app/modules/customers/components/customer-details/customer-details.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService, Customer, CustomerNote } from '../../../../core/services/customers.service';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import {NotificationService} from "../../../../core/services/notification.service";

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
    private appointmentsService: AppointmentsService,
    private notificationHelper: NotificationService,
    private confirmDialogService: ConfirmDialogService
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
      this.notificationHelper.error('Customer ID is missing');
      return;
    }

    this.customersService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.isLoading = false;
        this.notificationHelper.success(`Loaded customer details for ${customer.firstName} ${customer.lastName}`);
        this.loadCustomerAppointments(id);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customer details. Please try again.';
        this.isLoading = false;
        this.notificationHelper.handleError(error, 'Failed to load customer details');
      }
    });
  }

  loadCustomerAppointments(customerId: string): void {
    this.isLoadingAppointments = true;

    // Assuming we have a method to get customer appointments
    this.appointmentsService.getAppointmentsByCustomerId(customerId).subscribe({
      next: (appointments) => {
        // Filter appointments for this customer
        this.appointments = appointments;
        this.isLoadingAppointments = false;
      },
      error: (error) => {
        this.notificationHelper.handleError(error, 'Failed to load customer appointments');
        this.isLoadingAppointments = false;
      }
    });
  }

  editCustomer(): void {
    if (this.customer) {
      this.router.navigate(['/dashboard/customers/edit', this.customer.id]);
    }
  }

  async toggleCustomerStatus(): Promise<void> {
    if (!this.customer) return;

    const newStatus = !this.customer.active;
    const statusText = newStatus ? 'activate' : 'deactivate';

    const confirmed = await this.confirmDialogService.confirm({
      id: 'toggle-status',
      title: `Confirm Status Change`,
      message: `Are you sure you want to ${statusText} this customer?`,
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel',
      type: newStatus ? 'primary' : 'warning'
    });

    if (!confirmed) return;

    this.notificationHelper.info(`Processing status change...`);

    this.customersService.toggleCustomerStatus(this.customer.id, !this.customer.active).subscribe({
      next: (updatedCustomer) => {
        this.customer = updatedCustomer;
        const statusMessage = updatedCustomer.active ? 'activated' : 'deactivated';
      },
      error: (error) => {
        this.notificationHelper.handleError(error, 'Failed to update customer status');
      }
    });
  }

  async deleteCustomer(): Promise<void> {
    if (!this.customer) return;

    const confirmed = await this.confirmDialogService.confirmDelete('customer');

    if (!confirmed) return;

    this.notificationHelper.info('Processing deletion request...');

    this.customersService.deleteCustomer(this.customer.id).subscribe({
      next: () => {
        this.notificationHelper.deleted('customer');
        this.router.navigate(['/dashboard/customers']);
      },
      error: (error) => {
        this.notificationHelper.handleError(error, 'Failed to delete customer');
      }
    });
  }

  addNote(): void {
    if (!this.customer || !this.noteForm.valid) return;

    this.isAddingNote = true;
    this.notificationHelper.info('Adding note...');

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
        this.notificationHelper.success('Note added successfully');
      },
      error: (error) => {
        this.isAddingNote = false;
        this.notificationHelper.handleError(error, 'Failed to add note');
      }
    });
  }

  createAppointment(): void {
    if (this.customer) {
      // Navigate to new appointment form with customer ID pre-filled
      this.router.navigate(['/dashboard/appointments/new'], {
        queryParams: { customerId: this.customer.id }
      });
      this.notificationHelper.info(`Creating new appointment for ${this.customer.firstName} ${this.customer.lastName}`);
    }
  }

  setActiveTab(tab: 'details' | 'appointments' | 'notes'): void {
    this.activeTab = tab;
    this.notificationHelper.info(`Viewing ${tab} tab`);
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

  formatDateTime(dateString: string, timeString: string | undefined): string {
    if (!dateString) return 'Unknown date';

    const date = new Date(dateString);

    // Handle the case where timeString might not be a string
    if (typeof timeString === 'string' && timeString) {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes)) {
          date.setHours(hours);
          date.setMinutes(minutes);
        }
      }
    }

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
    if (amount === undefined || amount === null) return '$0.00';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/customers']);
    this.notificationHelper.info('Returning to customers list');
  }
}

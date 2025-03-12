// src/app/modules/customers/components/customer-form/customer-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService, Customer, CustomerFormData } from '../../../../core/services/customers.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  customerId: string | null = null;
  customer: Customer | null = null;

  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form with default values
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birthDate: [''],
      gender: [''],
      'address.street': [''],
      'address.city': [''],
      'address.state': [''],
      'address.zipCode': [''],
      'address.country': [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check if editing existing customer
    this.customerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.customerId;

    if (this.isEditMode && this.customerId) {
      this.loadCustomer(this.customerId);
    } else {
      this.isLoading = false;
    }
  }

  loadCustomer(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.customersService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.populateForm(customer);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customer details. Please try again.';
        this.isLoading = false;
        console.error('Error loading customer:', error);
      }
    });
  }

  populateForm(customer: Customer): void {
    let formattedDateParts = '';
    if (customer.birthDate) {
      formattedDateParts = customer.birthDate.map((part: number, index: number) => {
        return index > 0 ? part.toString().padStart(2, '0') : part;
      }).join('-');
    }
    console.log(formattedDateParts);
    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      birthDate: formattedDateParts,
      gender: customer.gender,
      'address.street': customer.address?.street || '',
      'address.city': customer.address?.city || '',
      'address.state': customer.address?.state || '',
      'address.zipCode': customer.address?.zipCode || '',
      'address.country': customer.address?.country || '',
      notes: '' // Notes are handled separately in the customer details
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Prepare form data
      const formValues = this.customerForm.value;
      const customerData: CustomerFormData = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone,
        birthDate: formValues.birthDate,
        gender: formValues.gender,
        notes: formValues.notes,
        address: {
          street: formValues['address.street'],
          city: formValues['address.city'],
          state: formValues['address.state'],
          zipCode: formValues['address.zipCode'],
          country: formValues['address.country']
        }
      };

      let hasAddress = false;
      if (customerData.address) {
        const addressValues = [
          customerData.address.street,
          customerData.address.city,
          customerData.address.state,
          customerData.address.zipCode,
          customerData.address.country
        ];

        hasAddress = addressValues.some(value => !!value);
      }

// If no address fields are filled, set address to undefined
      if (!hasAddress) {
        customerData.address = undefined;
      }


      if (this.isEditMode && this.customerId) {
        // Update existing customer
        this.customersService.updateCustomer(this.customerId, customerData).subscribe({
          next: () => {
            this.successMessage = 'Customer updated successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/customers', this.customerId]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to update customer. Please try again.';
            this.isSubmitting = false;
            console.error('Error updating customer:', error);
          }
        });
      } else {
        // Create new customer
        this.customersService.createCustomer(customerData).subscribe({
          next: (newCustomer) => {
            this.successMessage = 'Customer created successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/customers', newCustomer.id]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to create customer. Please try again.';
            this.isSubmitting = false;
            console.error('Error creating customer:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.customerForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.customerForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.customerForm.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return `This field is required`;
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    return '';
  }

  cancel(): void {
    if (this.isEditMode && this.customerId) {
      this.router.navigate(['/dashboard/customers', this.customerId]);
    } else {
      this.router.navigate(['/dashboard/customers']);
    }
  }
}

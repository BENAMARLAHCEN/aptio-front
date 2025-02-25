// src/app/modules/services/components/service-form/service-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ServicesService,
  Service,
  ServiceCategory,
  ServiceFormData
} from '../../../../core/services/services.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html'
})
export class ServiceFormComponent implements OnInit {
  serviceForm: FormGroup;
  categories: ServiceCategory[] = [];

  isEditMode = false;
  serviceId: string | null = null;
  service: Service | null = null;

  isLoading = true;
  isSubmitting = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form with default values
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      duration: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
      category: ['', Validators.required],
      active: [true],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    // Check if editing existing service
    this.serviceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.serviceId;

    // Load categories
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.servicesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;

        // If editing, load service details
        if (this.isEditMode && this.serviceId) {
          this.loadService(this.serviceId);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.isLoading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  loadService(id: string): void {
    this.servicesService.getServiceById(id).subscribe({
      next: (service) => {
        this.service = service;
        this.populateForm(service);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load service details. Please try again.';
        this.isLoading = false;
        console.error('Error loading service:', error);
      }
    });
  }

  populateForm(service: Service): void {
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      active: service.active,
      imageUrl: service.imageUrl || ''
    });
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formData: ServiceFormData = this.serviceForm.value;

      if (this.isEditMode && this.serviceId) {
        // Update existing service
        this.servicesService.updateService(this.serviceId, formData).subscribe({
          next: () => {
            this.successMessage = 'Service updated successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/services', this.serviceId]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to update service. Please try again.';
            this.isSubmitting = false;
            console.error('Error updating service:', error);
          }
        });
      } else {
        // Create new service
        this.servicesService.createService(formData).subscribe({
          next: (newService) => {
            this.successMessage = 'Service created successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/services', newService.id]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to create service. Please try again.';
            this.isSubmitting = false;
            console.error('Error creating service:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.serviceForm);
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
    const control = this.serviceForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.serviceForm.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return `This field is required`;
    }

    if (control.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength']?.requiredLength} characters required`;
    }

    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength']?.requiredLength} characters allowed`;
    }

    if (control.hasError('min')) {
      return `Minimum value is ${control.errors?.['min']?.min}`;
    }

    if (control.hasError('max')) {
      return `Maximum value is ${control.errors?.['max']?.max}`;
    }

    return '';
  }

  cancel(): void {
    if (this.isEditMode && this.serviceId) {
      this.router.navigate(['/dashboard/services', this.serviceId]);
    } else {
      this.router.navigate(['/dashboard/services']);
    }
  }
}

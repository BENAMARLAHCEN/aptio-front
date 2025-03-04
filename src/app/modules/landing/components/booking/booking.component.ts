// src/app/modules/landing/components/booking/booking.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ServicesService, Service, ServiceCategory } from '../../../../core/services/services.service';
import { AppointmentsService } from '../../../../core/services/appointments.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  // Form and step management
  bookingForm: FormGroup;
  currentStep = 1;
  isSubmitting = false;
  bookingSuccess = false;
  minDate: string;

  // Data loading states
  isLoading = true;
  isLoadingTimeSlots = false;
  errorMessage: string | null = null;

  // Service selection
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories: ServiceCategory[] = [];
  selectedService: Service | null = null;
  selectedCategory: string | null = null;
  availableTimeSlots: string[] = [];

  constructor(
      private fb: FormBuilder,
      private servicesService: ServicesService,
      private appointmentsService: AppointmentsService,
      private route: ActivatedRoute
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Initialize booking form
    this.bookingForm = this.fb.group({
      // Service step
      serviceId: ['', Validators.required],

      // Date and time step
      date: ['', Validators.required],
      time: ['', Validators.required],

      // Customer info step
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check for service ID in query params
    this.route.queryParams.subscribe(params => {
      const serviceId = params['serviceId'];
      if (serviceId) {
        // Pre-select service if provided in URL
        this.bookingForm.get('serviceId')?.setValue(serviceId);
      }
    });

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
            this.filteredServices = [...this.services];

            // If a service ID was pre-selected from URL params, select it
            const serviceId = this.bookingForm.get('serviceId')?.value;
            if (serviceId) {
              const service = this.services.find(s => s.id === serviceId);
              if (service) {
                this.selectService(service);
                // Move to next step
                this.currentStep = 2;
              }
            }

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

  // Handle category change
  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    this.selectedCategory = value === '' ? null : value;
    this.filterServices();
  }

  // Filter services based on selected category
  filterServices(): void {
    if (this.selectedCategory) {
      this.filteredServices = this.services.filter(service =>
          service.category === this.selectedCategory
      );
    } else {
      this.filteredServices = [...this.services];
    }
  }

  // Select a service
  selectService(service: Service): void {
    this.selectedService = service;
    this.bookingForm.get('serviceId')?.setValue(service.id);
  }

  // Handle date change
  onDateChange(): void {
    const date = this.bookingForm.get('date')?.value;
    const serviceId = this.bookingForm.get('serviceId')?.value;

    if (date && serviceId) {
      this.loadTimeSlots(date, serviceId);
    } else {
      // Clear time slots if date or service not selected
      this.availableTimeSlots = [];
      this.bookingForm.get('time')?.setValue('');
    }
  }

  // Load available time slots
  loadTimeSlots(date: string, serviceId: string): void {
    this.isLoadingTimeSlots = true;
    this.availableTimeSlots = [];

    this.appointmentsService.getAvailableTimeSlots(date, serviceId).subscribe({
      next: (timeSlots) => {
        this.availableTimeSlots = timeSlots;

        // Clear selected time if it's no longer available
        const currentTime = this.bookingForm.get('time')?.value;
        if (currentTime && !timeSlots.includes(currentTime)) {
          this.bookingForm.get('time')?.setValue('');
        }

        this.isLoadingTimeSlots = false;
      },
      error: (error) => {
        console.error('Error loading time slots:', error);
        this.isLoadingTimeSlots = false;
      }
    });
  }

  // Navigation methods
  goToNextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;

      // If moving to step 2, load time slots if service and date are selected
      if (this.currentStep === 2) {
        const date = this.bookingForm.get('date')?.value;
        const serviceId = this.bookingForm.get('serviceId')?.value;

        if (date && serviceId) {
          this.loadTimeSlots(date, serviceId);
        }
      }
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Form submission
  onSubmit(): void {
    if (this.bookingForm.valid && this.selectedService) {
      this.isSubmitting = true;

      // Prepare appointment data
      const appointmentData = {
        customerId: this.createTemporaryCustomerId(), // In a real system, you'd create or get a customer ID
        serviceId: this.bookingForm.get('serviceId')?.value,
        date: this.bookingForm.get('date')?.value,
        time: this.bookingForm.get('time')?.value,
        notes: this.bookingForm.get('notes')?.value
      };

      // In a real application, this would call the API to create the appointment
      // For this simulation, we'll just simulate a successful booking
      setTimeout(() => {
        this.isSubmitting = false;
        this.bookingSuccess = true;
      }, 1500);

      // In a real application:
      /*
      this.appointmentsService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.bookingSuccess = true;
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to book appointment. Please try again.';
          console.error('Error booking appointment:', error);
        }
      });
      */
    } else {
      this.markFormGroupTouched(this.bookingForm);
    }
  }

  // Helper method to create a temporary customer ID (for demo purposes only)
  createTemporaryCustomerId(): string {
    return 'temp-' + Math.random().toString(36).substring(2, 11);
  }

  // Reset form after successful booking
  resetForm(): void {
    this.bookingForm.reset();
    this.selectedService = null;
    this.currentStep = 1;
    this.bookingSuccess = false;
  }

  // Mark all form controls as touched to trigger validation
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Validation helpers
  isFieldInvalid(field: string): boolean {
    const control = this.bookingForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.bookingForm.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control.hasError('pattern')) {
      if (field === 'phone') {
        return 'Please enter a valid phone number';
      }
    }

    return 'Invalid input';
  }

  // Formatting helpers
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

  formatTimeForDisplay(timeString: string | null | undefined): string {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
  }

  formatSummaryDate(dateString: string | null | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
  }
}

// src/app/modules/landing/components/booking/booking.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServicesService, Service } from '../../../../core/services/services.service';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;
  services: Service[] = [];
  availableTimeSlots: string[] = [];

  selectedService: Service | null = null;
  selectedDate: string = '';

  isLoading = true;
  isLoadingTimeSlots = false;
  isSubmitting = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  currentStep = 1;
  totalSteps = 3;

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServices();

    // Check for query parameters (serviceId)
    this.route.queryParams.subscribe(params => {
      if (params['serviceId']) {
        this.preSelectService(params['serviceId']);
      }
    });
  }

  initForm(): void {
    const today = new Date();
    const formattedDate = this.formatDateForInput(today);

    this.bookingForm = this.fb.group({
      // Step 1: Service Selection
      serviceId: ['', Validators.required],

      // Step 2: Date & Time Selection
      date: [formattedDate, Validators.required],
      time: ['', Validators.required],

      // Step 3: Customer Information
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required]
      }),
      notes: ['']
    });

    // Subscribe to serviceId changes
    this.bookingForm.get('serviceId')?.valueChanges.subscribe(serviceId => {
      if (serviceId) {
        this.selectedService = this.services.find(service => service.id === serviceId) || null;
        this.loadTimeSlots();
      } else {
        this.selectedService = null;
        this.availableTimeSlots = [];
      }
    });

    // Subscribe to date changes
    this.bookingForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        this.selectedDate = date;
        this.loadTimeSlots();
      }
    });
  }

  loadServices(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.servicesService.getServices().subscribe({
      next: (services) => {
        // Show only active services
        this.services = services.filter(service => service.active);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load services. Please try again.';
        this.isLoading = false;
        console.error('Error loading services:', error);
      }
    });
  }

  preSelectService(serviceId: string): void {
    // This will be called when the component is loaded with a serviceId query parameter
    this.servicesService.getServiceById(serviceId).subscribe({
      next: (service) => {
        if (service && service.active) {
          this.bookingForm.patchValue({ serviceId: service.id });
          this.selectedService = service;
        }
      },
      error: (error) => {
        console.error('Error pre-selecting service:', error);
      }
    });
  }

  loadTimeSlots(): void {
    const serviceId = this.bookingForm.get('serviceId')?.value;
    const date = this.bookingForm.get('date')?.value;

    if (!serviceId || !date) {
      this.availableTimeSlots = [];
      return;
    }

    this.isLoadingTimeSlots = true;
    this.bookingForm.get('time')?.setValue('');

    this.appointmentsService.getAvailableTimeSlots(date, serviceId).subscribe({
      next: (timeSlots) => {
        this.availableTimeSlots = timeSlots;
        this.isLoadingTimeSlots = false;
      },
      error: (error) => {
        console.error('Error loading time slots:', error);
        this.isLoadingTimeSlots = false;
        this.availableTimeSlots = [];
      }
    });
  }

  nextStep(): void {
    // Validate current step before proceeding
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      default:
        return true;
    }
  }

  validateStep1(): boolean {
    const serviceControl = this.bookingForm.get('serviceId');
    if (serviceControl?.invalid) {
      serviceControl.markAsTouched();
      return false;
    }
    return true;
  }

  validateStep2(): boolean {
    const dateControl = this.bookingForm.get('date');
    const timeControl = this.bookingForm.get('time');

    let valid = true;
    if (dateControl?.invalid) {
      dateControl.markAsTouched();
      valid = false;
    }

    if (timeControl?.invalid) {
      timeControl.markAsTouched();
      valid = false;
    }

    return valid;
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation
    this.markFormGroupTouched(this.bookingForm);

    if (this.bookingForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Check if user is authenticated
      if (this.authService.isAuthenticated()) {
        // If authenticated, use the user's ID for the booking
        this.submitBooking();
      } else {
        // If not authenticated, prompt to sign in or continue as guest
        // For this example, we'll just proceed with booking as guest
        this.submitBooking();
      }
    }
  }

  submitBooking(): void {
    // Prepare appointment data
    const formData = this.bookingForm.value;

    const appointmentData = {
      serviceId: formData.serviceId,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
      // For guest booking, we create a temporary customer record
      customerId: 'guest',
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      }
    };

    // Use AppointmentsService to create appointment
    this.appointmentsService.createGuestAppointment(appointmentData).subscribe({
      next: (appointment) => {
        this.successMessage = 'Appointment booked successfully!';
        this.isSubmitting = false;

        // Reset form after successful submission
        this.bookingForm.reset();
        this.currentStep = 1;

        // If we want to redirect to a confirmation page later
        // this.router.navigate(['/booking/confirmation', appointment.id]);
      },
      error: (error) => {
        this.errorMessage = 'Failed to book appointment. Please try again.';
        this.isSubmitting = false;
        console.error('Error booking appointment:', error);
      }
    });
  }

  selectTimeSlot(time: string): void {
    this.bookingForm.get('time')?.setValue(time);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.bookingForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  isAddressFieldInvalid(field: string): boolean {
    const control = this.bookingForm.get(`address.${field}`);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.bookingForm.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return `This field is required`;
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    return '';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  datenow = new Date();

  formatDateForInput(date: Date): string {
    if (!(date instanceof Date)) {
      date = new Date(); // Use current date as fallback
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
}

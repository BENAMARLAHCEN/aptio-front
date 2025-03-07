// src/app/modules/booking/components/booking/booking.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicesService, Service } from '../../../../core/services/services.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentsService } from '../../../../core/services/appointments.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  services: Service[] = [];
  availableTimeSlots: string[] = [];
  isLoading = true;
  isSubmitting = false;
  isLoadingTimeSlots = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form with default values
    this.bookingForm = this.fb.group({
      serviceId: ['', Validators.required],
      date: [this.formatDateForInput(new Date()), Validators.required],
      time: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.servicesService.getServices().subscribe({
      next: (services) => {
        // Only load active services
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

  onServiceChange(): void {
    const date = this.bookingForm.get('date')?.value;
    const serviceId = this.bookingForm.get('serviceId')?.value;

    if (date && serviceId) {
      this.loadTimeSlots(date, serviceId);
    }
  }

  onDateChange(): void {
    const date = this.bookingForm.get('date')?.value;
    const serviceId = this.bookingForm.get('serviceId')?.value;

    if (date && serviceId) {
      this.loadTimeSlots(date, serviceId);
    } else if (date) {
      // If no service selected yet, just clear time slots
      this.availableTimeSlots = [];
      this.bookingForm.get('time')?.setValue('');
    }
  }

  loadTimeSlots(date: string, serviceId: string): void {
    this.isLoadingTimeSlots = true;
    this.availableTimeSlots = [];

    this.appointmentsService.getAvailableTimeSlots(date, serviceId).subscribe({
      next: (timeSlots) => {
        this.availableTimeSlots = timeSlots;
        this.isLoadingTimeSlots = false;
      },
      error: (error) => {
        console.error('Error loading time slots:', error);
        this.isLoadingTimeSlots = false;
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Get current user ID from auth service
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        this.errorMessage = 'You must be logged in to book an appointment.';
        this.isSubmitting = false;
        return;
      }

      // Prepare appointment data
      const appointmentData = {
        ...this.bookingForm.value,
        customerId: currentUser.userId
      };

      // Create the appointment
      this.appointmentsService.createAppointment(appointmentData).subscribe({
        next: (appointment) => {
          this.successMessage = 'Your appointment has been booked successfully!';
          this.isSubmitting = false;
          // Navigate to confirmation page after a short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard/booking/confirmation', appointment.id]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to book appointment. Please try again.';
          this.isSubmitting = false;
          console.error('Error booking appointment:', error);
        }
      });
    } else {
      // Mark all form controls as touched to show validation errors
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
    }
  }

  getServiceById(id: string): Service | undefined {
    return this.services.find(service => service.id === id);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.bookingForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.bookingForm.get(field);
    if (!control) return '';
    if (control.hasError('required')) return 'This field is required';
    return '';
  }

  formatTimeForDisplay(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }

    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }
}

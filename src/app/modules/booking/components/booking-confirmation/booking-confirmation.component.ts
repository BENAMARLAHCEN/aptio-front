// src/app/modules/booking/components/booking-confirmation/booking-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService, Service } from '../../../../core/services/services.service';
import { AppointmentsService } from '../../../../core/services/appointments.service';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html'
})
export class BookingConfirmationComponent implements OnInit {
  serviceId: string | null = null;
  selectedService: Service | null = null;
  selectedDate: string | null = null;
  selectedTime: string | null = null;

  bookingForm: FormGroup;

  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  bookingSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private appointmentsService: AppointmentsService
  ) {
    this.bookingForm = this.fb.group({
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Get parameters from route
    this.serviceId = this.route.snapshot.paramMap.get('serviceId');
    this.selectedDate = this.route.snapshot.paramMap.get('date');
    const encodedTime = this.route.snapshot.paramMap.get('time');

    if (encodedTime) {
      this.selectedTime = decodeURIComponent(encodedTime);
    }

    if (!this.serviceId || !this.selectedDate || !this.selectedTime) {
      this.errorMessage = 'Missing required booking information';
      this.isLoading = false;
      return;
    }

    this.loadServiceDetails();
  }

  loadServiceDetails(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (!this.serviceId) return;

    this.servicesService.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        this.selectedService = service;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading service details:', error);
        this.errorMessage = 'Failed to load service details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  confirmBooking(): void {
    if (!this.serviceId || !this.selectedDate || !this.selectedTime) {
      this.errorMessage = 'Missing required booking information';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const appointmentData = {
      serviceId: this.serviceId,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.bookingForm.value.notes
    };

    this.appointmentsService.createUserAppointment(appointmentData).subscribe({
      next: (appointment) => {
        this.isSubmitting = false;
        this.bookingSuccess = true;
      },
      error: (error) => {
        console.error('Error booking appointment:', error);
        this.errorMessage = 'Failed to book appointment. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  cancelBooking(): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.router.navigate(['/dashboard']);
    }
  }

  formatDateLong(dateString: string | null): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return '';

    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  }

  goBack(): void {
    if (this.serviceId) {
      this.router.navigate(['/dashboard/booking/time', this.serviceId]);
    } else {
      this.router.navigate(['/dashboard/booking/service']);
    }
  }

  viewAppointments(): void {
    this.router.navigate(['/dashboard/my-appointments']);
  }
}

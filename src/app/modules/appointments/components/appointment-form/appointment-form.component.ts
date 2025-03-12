// src/app/modules/appointments/components/appointment-form/appointment-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppointmentsService,
  Appointment,
  Service,
  Customer,
  AppointmentFormData
} from '../../../../core/services/appointments.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html'
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  customers: Customer[] = [];
  services: Service[] = [];
  availableTimeSlots: string[] = [];

  isEditMode = false;
  appointmentId: string | null = null;
  appointment: Appointment | null = null;

  isLoading = true;
  isSubmitting = false;
  isLoadingTimeSlots = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentsService: AppointmentsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form with default values
    this.appointmentForm = this.fb.group({
      customerId: ['', Validators.required],
      serviceId: ['', Validators.required],
      date: [this.formatDateForInput(new Date()), Validators.required],
      time: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check if editing existing appointment
    this.appointmentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.appointmentId;

    // Load all required data
    this.loadFormData();
  }

  loadFormData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Load customers
    this.appointmentsService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;

        // Load services
        this.appointmentsService.getServices().subscribe({
          next: (services) => {
            this.services = services;

            // If editing, load appointment details
            if (this.isEditMode && this.appointmentId) {
              this.loadAppointment(this.appointmentId);
            } else {
              this.isLoading = false;
              // For new appointments, load available time slots for today
              this.onDateChange();
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to load services. Please try again.';
            this.isLoading = false;
            console.error('Error loading services:', error);
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customers. Please try again.';
        this.isLoading = false;
        console.error('Error loading customers:', error);
      }
    });
  }

  loadAppointment(id: string): void {
    this.appointmentsService.getAppointmentById(id).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.populateForm(appointment);
        this.isLoading = false;
        const formattedDateParts = appointment.date.map((part:number, index:number) => {
          return index > 0 ? part.toString().padStart(2, '0') : part;
        }).join('-');
        this.loadTimeSlots(formattedDateParts, appointment.serviceId);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load appointment details. Please try again.';
        this.isLoading = false;
        console.error('Error loading appointment:', error);
      }
    });
  }

  populateForm(appointment: Appointment): void {
    // Format the date parts with leading zeros
    const formattedDateParts = appointment.date.map((part:number, index:number) => {
      // Index 0 is year (keep as is), index 1 is month, index 2 is day (pad these)
      return index > 0 ? part.toString().padStart(2, '0') : part;
    }).join('-');
    // Now displays: Populating form with: 2025-03-21
    this.appointmentForm.patchValue({
      customerId: appointment.customerId,
      serviceId: appointment.serviceId,
      date: formattedDateParts,
      time: appointment.time,
      notes: appointment.notes || ''
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formData: AppointmentFormData = this.appointmentForm.value;

      if (this.isEditMode && this.appointmentId) {
        // Update existing appointment
        this.appointmentsService.updateAppointment(this.appointmentId, formData).subscribe({
          next: () => {
            this.successMessage = 'Appointment updated successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/appointments', this.appointmentId]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to update appointment. Please try again.';
            this.isSubmitting = false;
            console.error('Error updating appointment:', error);
          }
        });
      } else {
        // Create new appointment
        this.appointmentsService.createAppointment(formData).subscribe({
          next: (newAppointment) => {
            this.successMessage = 'Appointment created successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/appointments', newAppointment.id]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to create appointment. Please try again.';
            this.isSubmitting = false;
            console.error('Error creating appointment:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.appointmentForm);
    }
  }

  onDateChange(): void {
    const date = this.appointmentForm.get('date')?.value;
    const serviceId = this.appointmentForm.get('serviceId')?.value;

    if (date && serviceId) {
      this.loadTimeSlots(date, serviceId);
    } else if (date) {
      this.availableTimeSlots = [];
      this.appointmentForm.get('time')?.setValue('');
    }
  }

  onServiceChange(): void {
    const date = this.appointmentForm.get('date')?.value;
    const serviceId = this.appointmentForm.get('serviceId')?.value;

    if (date && serviceId) {
      this.loadTimeSlots(date, serviceId);
    }
  }

  loadTimeSlots(date: string, serviceId: string): void {
    this.isLoadingTimeSlots = true;
    this.availableTimeSlots = [];

    this.appointmentsService.getAvailableTimeSlots(date, serviceId).subscribe({
      next: (timeSlots) => {
        this.availableTimeSlots = timeSlots;

        // If editing, check if current time slot is not in available slots
        // (this can happen if we're keeping the same slot when editing)
        const currentTime = this.appointmentForm.get('time')?.value;
        if (this.isEditMode && currentTime && !timeSlots.includes(currentTime) && this.appointment?.time === currentTime) {
          // Add the current time slot to the available slots
          this.availableTimeSlots.push(currentTime);
          this.availableTimeSlots.sort();
        } else if (!timeSlots.includes(currentTime)) {
          // Clear the time selection if the currently selected time is no longer available
          this.appointmentForm.get('time')?.setValue('');
        }

        this.isLoadingTimeSlots = false;
      },
      error: (error) => {
        console.error('Error loading time slots:', error);
        this.isLoadingTimeSlots = false;
      }
    });
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
    const control = this.appointmentForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.appointmentForm.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return `This field is required`;
    }

    return '';
  }

  getServiceById(id: string): Service | undefined {
    return this.services.find(service => service.id === id);
  }

  formatTimeForDisplay(time: any): string {
    const date = new Date();
    date.setHours(time[0]);
    date.setMinutes(time[1]);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancel(): void {
    if (this.isEditMode && this.appointmentId) {
      this.router.navigate(['/dashboard/appointments', this.appointmentId]);
    } else {
      this.router.navigate(['/dashboard/appointments']);
    }
  }
}

// src/app/modules/settings/components/settings/settings.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, BusinessSettings } from '../../../../core/services/settings.service';
import { DateUtilService } from '../../../../core/services/date-util.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  businessSettings!: BusinessSettings;

  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  daysOfWeek = this.settingsService.getDaysOfWeek();

  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private dateUtilService: DateUtilService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSettings();
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      businessName: ['', [Validators.required]],
      businessHoursStart: ['09:00', [Validators.required]],
      businessHoursEnd: ['18:00', [Validators.required]],
      daysOpen: this.fb.array(
        this.daysOfWeek.map(() => this.fb.control(false))
      ),
      defaultAppointmentDuration: [30, [Validators.required, Validators.min(5), Validators.max(240)]],
      timeSlotInterval: [15, [Validators.required, Validators.min(5), Validators.max(60)]],
      allowOverlappingAppointments: [false],
      bufferTimeBetweenAppointments: [5, [Validators.required, Validators.min(0), Validators.max(60)]],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      website: ['']
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.settingsService.getBusinessSettings().subscribe({
      next: (settings) => {
        this.businessSettings = settings;
        this.populateForm(settings);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading business settings:', error);
        this.errorMessage = 'Failed to load business settings. Please try again.';
        this.isLoading = false;
      }
    });
  }

  populateForm(settings: BusinessSettings): void {
    // Convert daysOpen string to array of booleans
    const daysOpenArray = this.settingsService.daysOpenStringToArray(settings.daysOpen);

    this.settingsForm.patchValue({
      businessName: settings.businessName,
      businessHoursStart: settings.businessHoursStart,
      businessHoursEnd: settings.businessHoursEnd,
      defaultAppointmentDuration: settings.defaultAppointmentDuration,
      timeSlotInterval: settings.timeSlotInterval,
      allowOverlappingAppointments: settings.allowOverlappingAppointments,
      bufferTimeBetweenAppointments: settings.bufferTimeBetweenAppointments,
      address: settings.address || '',
      phone: settings.phone || '',
      email: settings.email || '',
      website: settings.website || ''
    });

    // Set days open checkboxes
    const daysOpenFormArray = this.settingsForm.get('daysOpen') as any;
    daysOpenArray.forEach((isOpen: boolean, index: number) => {
      daysOpenFormArray.controls[index].setValue(isOpen);
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Get form values
      const formValues = this.settingsForm.value;

      // Convert daysOpen array to string
      const daysOpenString = this.settingsService.daysOpenArrayToString(formValues.daysOpen);

      // Prepare settings object
      const updatedSettings: BusinessSettings = {
        ...this.businessSettings,
        businessName: formValues.businessName,
        businessHoursStart: formValues.businessHoursStart,
        businessHoursEnd: formValues.businessHoursEnd,
        daysOpen: daysOpenString,
        defaultAppointmentDuration: formValues.defaultAppointmentDuration,
        timeSlotInterval: formValues.timeSlotInterval,
        allowOverlappingAppointments: formValues.allowOverlappingAppointments,
        bufferTimeBetweenAppointments: formValues.bufferTimeBetweenAppointments,
        address: formValues.address,
        phone: formValues.phone,
        email: formValues.email,
        website: formValues.website
      };

      // Update settings
      this.settingsService.updateBusinessSettings(updatedSettings).subscribe({
        next: (result) => {
          this.businessSettings = result;
          this.successMessage = 'Business settings updated successfully!';
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating business settings:', error);
          this.errorMessage = 'Failed to update business settings. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation errors
      this.markFormGroupTouched(this.settingsForm);
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);

    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    if (field.errors['email']) return 'Please enter a valid email address';

    return 'Invalid input';
  }

  resetForm(): void {
    if (confirm('Are you sure you want to reset all changes?')) {
      this.populateForm(this.businessSettings);
    }
  }

  formatTime(time: string): string {
    return this.dateUtilService.formatTime(time);
  }
}

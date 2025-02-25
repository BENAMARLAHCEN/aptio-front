import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators, FormControl} from '@angular/forms';
import { ScheduleService, ScheduleSettings } from '../../../../core/services/schedule.service';

@Component({
  selector: 'app-schedule-settings',
  templateUrl: './schedule-settings.component.html'
})
export class ScheduleSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  scheduleSettings: ScheduleSettings | null = null;

  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  timeSlotOptions = [5, 10, 15, 20, 30, 60];
  bufferTimeOptions = [0, 5, 10, 15, 30];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService
  ) {
    // Initialize form with default values
    this.settingsForm = this.fb.group({
      businessHours: this.fb.group({
        startTime: ['09:00', Validators.required],
        endTime: ['17:00', Validators.required]
      }),
      daysOpen: this.fb.array(this.daysOfWeek.map(() => false)),
      defaultAppointmentDuration: [30, Validators.required],
      timeSlotInterval: [15, Validators.required],
      allowOverlappingAppointments: [false],
      bufferTimeBetweenAppointments: [5, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.scheduleService.getScheduleSettings().subscribe({
      next: (settings) => {
        this.scheduleSettings = settings;
        this.populateForm(settings);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load schedule settings.';
        this.isLoading = false;
        console.error('Error loading schedule settings:', error);
      }
    });
  }

  populateForm(settings: ScheduleSettings): void {
    // Set form values from settings
    this.settingsForm.patchValue({
      businessHours: {
        startTime: settings.businessHours.startTime,
        endTime: settings.businessHours.endTime
      },
      defaultAppointmentDuration: settings.defaultAppointmentDuration,
      timeSlotInterval: settings.timeSlotInterval,
      allowOverlappingAppointments: settings.allowOverlappingAppointments,
      bufferTimeBetweenAppointments: settings.bufferTimeBetweenAppointments
    });

    // Set days open checkboxes
    const daysOpenArray = this.settingsForm.get('daysOpen') as FormArray;
    settings.daysOpen.forEach((isOpen, index) => {
      daysOpenArray.at(index).setValue(isOpen);
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.isSaving = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Create settings object from form
      const formValues = this.settingsForm.value;
      const updatedSettings: ScheduleSettings = {
        businessHours: {
          startTime: formValues.businessHours.startTime,
          endTime: formValues.businessHours.endTime
        },
        daysOpen: formValues.daysOpen,
        defaultAppointmentDuration: formValues.defaultAppointmentDuration,
        timeSlotInterval: formValues.timeSlotInterval,
        allowOverlappingAppointments: formValues.allowOverlappingAppointments,
        bufferTimeBetweenAppointments: formValues.bufferTimeBetweenAppointments
      };

      this.scheduleService.updateScheduleSettings(updatedSettings).subscribe({
        next: (settings) => {
          this.scheduleSettings = settings;
          this.isSaving = false;
          this.successMessage = 'Schedule settings updated successfully!';

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update schedule settings.';
          this.isSaving = false;
          console.error('Error updating schedule settings:', error);
        }
      });
    } else {
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

  isFieldInvalid(fieldName: string, parentGroup?: string): boolean {
    const control = parentGroup ?
      this.settingsForm.get(`${parentGroup}.${fieldName}`) :
      this.settingsForm.get(fieldName);

    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(fieldName: string, parentGroup?: string): string {
    const control = parentGroup ?
      this.settingsForm.get(`${parentGroup}.${fieldName}`) :
      this.settingsForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }

    return '';
  }

  get daysOpenControls(): FormArray {
    return this.settingsForm.get('daysOpen') as FormArray;
  }
  getDayControl(index: number): FormControl {
    return this.daysOpenControls.at(index) as FormControl;
  }

  resetForm(): void {
    if (this.scheduleSettings) {
      this.populateForm(this.scheduleSettings);
    }
  }
}

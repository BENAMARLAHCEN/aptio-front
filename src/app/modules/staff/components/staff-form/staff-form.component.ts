// src/app/modules/staff/components/staff-form/staff-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService, Staff, WorkHours } from '../../../../core/services/staff.service';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html'
})
export class StaffFormComponent implements OnInit {
  staffForm: FormGroup;
  isEditMode = false;
  staffId: string | null = null;
  staff: Staff | null = null;

  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Common position options
  positions: string[] = [
    'Manager',
    'Receptionist',
    'Hair Stylist',
    'Colorist',
    'Nail Technician',
    'Massage Therapist',
    'Esthetician',
    'Makeup Artist'
  ];

  // Common specialty options
  specialtyOptions: string[] = [
    'Haircut',
    'Hair Coloring',
    'Styling',
    'Beard Trim',
    'Manicure',
    'Pedicure',
    'Nail Art',
    'Gel Nails',
    'Facial',
    'Massage',
    'Swedish Massage',
    'Deep Tissue',
    'Hot Stone',
    'Makeup',
    'Waxing'
  ];

  // Color options
  colorOptions: string[] = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#607D8B'  // Blue Grey
  ];

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form with default values
    this.staffForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      position: ['', Validators.required],
      specialties: [[]],
      color: ['#4CAF50'],
      avatar: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Check if editing existing staff
    this.staffId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.staffId;

    if (this.isEditMode && this.staffId) {
      this.loadStaff(this.staffId);
    } else {
      this.isLoading = false;
    }
  }

  loadStaff(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.staffService.getStaffById(id).subscribe({
      next: (staff) => {
        this.staff = staff;
        this.populateForm(staff);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load staff details. Please try again.';
        this.isLoading = false;
        console.error('Error loading staff:', error);
      }
    });
  }

  populateForm(staff: Staff): void {
    this.staffForm.patchValue({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      position: staff.position,
      specialties: Array.from(staff.specialties),
      color: staff.color,
      avatar: staff.avatar || '',
      isActive: staff.isActive
    });
  }

  onSubmit(): void {
    if (this.staffForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formData = this.staffForm.value;

      if (this.isEditMode && this.staffId) {
        // Update existing staff
        this.staffService.updateStaff(this.staffId, formData).subscribe({
          next: () => {
            this.successMessage = 'Staff updated successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/staff', this.staffId]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to update staff. Please try again.';
            this.isSubmitting = false;
            console.error('Error updating staff:', error);
          }
        });
      } else {
        // Create new staff
        this.staffService.createStaff(formData).subscribe({
          next: (newStaff) => {
            this.successMessage = 'Staff created successfully!';
            this.isSubmitting = false;
            setTimeout(() => {
              this.router.navigate(['/dashboard/staff', newStaff.id]);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = 'Failed to create staff. Please try again.';
            this.isSubmitting = false;
            console.error('Error creating staff:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.staffForm);
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
    const control = this.staffForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.staffForm.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return `This field is required`;
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    return '';
  }

  compareSpecialties(option: string, selected: string[]): boolean {
    return selected?.includes(option) || false;
  }

  toggleSpecialty(specialty: string): void {
    const currentSpecialties = [...this.staffForm.get('specialties')?.value || []];
    const index = currentSpecialties.indexOf(specialty);

    if (index === -1) {
      // Add specialty
      currentSpecialties.push(specialty);
    } else {
      // Remove specialty
      currentSpecialties.splice(index, 1);
    }

    this.staffForm.get('specialties')?.setValue(currentSpecialties);
  }

  isSpecialtySelected(specialty: string): boolean {
    const specialties = this.staffForm.get('specialties')?.value as string[] || [];
    return specialties.includes(specialty);
  }

  setColor(color: string): void {
    this.staffForm.get('color')?.setValue(color);
  }

  cancel(): void {
    if (this.isEditMode && this.staffId) {
      this.router.navigate(['/dashboard/staff', this.staffId]);
    } else {
      this.router.navigate(['/dashboard/staff']);
    }
  }
}

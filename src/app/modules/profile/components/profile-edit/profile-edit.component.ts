// src/app/modules/profile/components/profile-edit/profile-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, User } from '../../../../core/services/user.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  isLoading = true;
  isSaving = false;
  activeSection = 'profile'; // 'profile' or 'password'
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize forms with default values
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      birthday: [''],
      'address.street': [''],
      'address.city': [''],
      'address.postalCode': ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['section'] === 'password') {
        this.activeSection = 'password';
      }
    });

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.populateForm(user);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
        console.error('Error loading user profile:', error);
      }
    });
  }

  populateForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      birthday: this.formatDateForInput(user.birthday),
      'address.street': user.address?.street || '',
      'address.city': user.address?.city || '',
      'address.postalCode': user.address?.postalCode || ''
    });

    if (user.profilePhoto) {
      this.previewUrl = user.profilePhoto;
    }
  }

  formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSaveProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValues = this.profileForm.value;

      // Restructure address fields
      const userData: Partial<User> = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone,
        birthday: formValues.birthday ? new Date(formValues.birthday) : undefined,
        address: {
          street: formValues['address.street'],
          city: formValues['address.city'],
          postalCode: formValues['address.postalCode']
        }
      };

      this.userService.updateProfile(userData).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;

          // If a new photo was selected, upload it
          if (this.selectedFile) {
            this.uploadProfilePhoto();
          } else {
            this.isSaving = false;
            this.successMessage = 'Profile updated successfully!';
            setTimeout(() => this.router.navigate(['/dashboard/profile']), 1500);
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to update profile. Please try again.';
          this.isSaving = false;
          console.error('Error updating profile:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isSaving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Password changed successfully!';
          this.passwordForm.reset();
          setTimeout(() => this.router.navigate(['/dashboard/profile']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to change password. Please verify your current password and try again.';
          this.isSaving = false;
          console.error('Error changing password:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  uploadProfilePhoto(): void {
    if (!this.selectedFile) {
      this.isSaving = false;
      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => this.router.navigate(['/dashboard/profile']), 1500);
      return;
    }

    this.userService.updateProfilePhoto(this.selectedFile).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.router.navigate(['/dashboard/profile']), 1500);
      },
      error: (error) => {
        // Profile was updated but photo upload failed
        this.errorMessage = 'Profile updated but failed to upload photo.';
        this.isSaving = false;
        console.error('Error uploading photo:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
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

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return `This field is required`;
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength']?.requiredLength} characters required`;
    }

    return '';
  }

  switchSection(section: string): void {
    this.activeSection = section;
  }

  cancelEdit(): void {
    this.router.navigate(['/dashboard/profile']);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService, UserProfile, PasswordUpdate } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  showPasswordForm = false;
  activeTab = 'profile';

  isLoading = true;
  isSubmitting = false;
  isChangingPassword = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;
  passwordError: string | null = null;
  passwordSuccess: string | null = null;

  profile: UserProfile | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();

    // Check if the route has a fragment for changing password
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'change-password') {
        this.activeTab = 'security';
        this.showPasswordForm = true;
      }
    });
  }

  initForms(): void {
    // Initialize profile form
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [''],
      'address.street': [''],
      'address.city': [''],
      'address.state': [''],
      'address.zipCode': [''],
      'address.country': ['']
    });

    // Initialize password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.profileService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.populateForm(profile);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  populateForm(profile: UserProfile): void {
    let formattedDate = profile.birthDate;
    if (profile.birthDate){
      formattedDate = profile.birthDate.map((part: number, index: number) => {
        return index > 0 ? part.toString().padStart(2, '0') : part;
      }).join('-');
    }
    console.log(formattedDate)
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || '',
      birthDate: formattedDate || '',
      'address.street': profile.address?.street || '',
      'address.city': profile.address?.city || '',
      'address.state': profile.address?.state || '',
      'address.zipCode': profile.address?.zipCode || '',
      'address.country': profile.address?.country || ''
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Prepare form data
      const formValues = this.profileForm.value;
      const profileData: Partial<UserProfile> = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone,
        birthDate: formValues.birthDate,
        address: {
          street: formValues['address.street'],
          city: formValues['address.city'],
          state: formValues['address.state'],
          zipCode: formValues['address.zipCode'],
          country: formValues['address.country']
        }
      };

      // Check if address is empty
      const hasAddress = Object.values(profileData.address || {}).some(value => !!value);
      if (!hasAddress) {
        profileData.address = undefined;
      }

      this.profileService.updateProfile(profileData).subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          this.successMessage = 'Profile updated successfully!';
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to update profile. Please try again.';
          this.isSubmitting = false;
          console.error('Error updating profile:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      this.passwordError = null;
      this.passwordSuccess = null;

      const passwordData: PasswordUpdate = this.passwordForm.value;

      this.profileService.changePassword(passwordData).subscribe({
        next: () => {
          this.passwordSuccess = 'Password changed successfully!';
          this.isChangingPassword = false;
          this.passwordForm.reset();
        },
        error: (error) => {
          this.passwordError = error.error?.message || 'Failed to change password. Please try again.';
          this.isChangingPassword = false;
          console.error('Error changing password:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
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

  passwordMatchValidator(g: FormGroup): { [key: string]: boolean } | null {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }

    return null;
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
      const minLength = control.getError('minlength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }

    if (control.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
      this.passwordError = null;
      this.passwordSuccess = null;
    }
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  cancel(): void {
    this.router.navigate(['/dashboard/profile']);
  }
}

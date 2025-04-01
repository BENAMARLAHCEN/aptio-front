import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showAddressFields = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
        country: ['']
      })
    });
  }

  toggleAddressFields(): void {
    this.showAddressFields = !this.showAddressFields;
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.registerForm.get(field);
    return formControl ? formControl.invalid && formControl.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Check if any address fields are filled
      const addressGroup = this.registerForm.get('address');
      const addressValues = addressGroup?.value;
      const hasAddressData = Object.values(addressValues).some(value =>
        typeof value === 'string' && value.trim() !== '');

      // Remove address if all fields are empty
      const formData = { ...this.registerForm.value };
      if (!hasAddressData) {
        formData.address = null;
      }

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          const redirectRoute = this.authService.getHomeRouteBasedOnRole();
          this.router.navigate([redirectRoute]);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'An error occurred during registration';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}

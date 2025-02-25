// src/app/modules/services/components/service-categories/service-categories.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicesService, ServiceCategory } from '../../../../core/services/services.service';

@Component({
  selector: 'app-service-categories',
  templateUrl: './service-categories.component.html'
})
export class ServiceCategoriesComponent implements OnInit {
  categories: ServiceCategory[] = [];
  categoryForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  editingCategoryId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.maxLength(200)],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.servicesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.isLoading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      const categoryData = this.categoryForm.value;

      if (this.editingCategoryId) {
        // Update existing category
        this.servicesService.updateCategory(this.editingCategoryId, categoryData).subscribe({
          next: () => {
            this.successMessage = 'Category updated successfully!';
            this.loadCategories();
            this.resetForm();
          },
          error: (error) => {
            this.errorMessage = 'Failed to update category. Please try again.';
            this.isSubmitting = false;
            console.error('Error updating category:', error);
          }
        });
      } else {
        // Create new category
        this.servicesService.createCategory(categoryData).subscribe({
          next: () => {
            this.successMessage = 'Category created successfully!';
            this.loadCategories();
            this.resetForm();
          },
          error: (error) => {
            this.errorMessage = 'Failed to create category. Please try again.';
            this.isSubmitting = false;
            console.error('Error creating category:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.categoryForm);
    }
  }

  editCategory(category: ServiceCategory): void {
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      active: category.active
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.editingCategoryId = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      active: true
    });
    this.isSubmitting = false;
  }

  deleteCategory(category: ServiceCategory): void {
    if (category.servicesCount > 0) {
      alert(`Cannot delete category "${category.name}" because it contains ${category.servicesCount} services. Reassign or delete those services first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return;
    }

    this.servicesService.deleteCategory(category.id).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully!';
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete category. Please try again.';
        console.error('Error deleting category:', error);
      }
    });
  }

  toggleCategoryStatus(category: ServiceCategory): void {
    const updatedData = {
      active: !category.active
    };

    this.servicesService.updateCategory(category.id, updatedData).subscribe({
      next: () => {
        category.active = !category.active; // Update locally
      },
      error: (error) => {
        console.error('Error toggling category status:', error);
        // Show error notification
      }
    });
  }

  viewCategoryServices(category: ServiceCategory): void {
    this.router.navigate(['/dashboard/services'], { queryParams: { category: category.name } });
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
    const control = this.categoryForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.categoryForm.get(field);

    if (!control) return '';

    if (control.hasError('required')) {
      return `This field is required`;
    }

    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength']?.requiredLength} characters allowed`;
    }

    return '';
  }

  goBack(): void {
    this.router.navigate(['/dashboard/services']);
  }
}

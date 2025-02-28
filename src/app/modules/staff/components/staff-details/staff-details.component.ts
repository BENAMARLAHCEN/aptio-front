// src/app/modules/staff/components/staff-details/staff-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService, Staff, WorkHours } from '../../../../core/services/staff.service';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html'
})
export class StaffDetailsComponent implements OnInit {
  staff: Staff | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  // Active tab
  activeTab: 'details' | 'schedule' | 'appointments' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public staffService: StaffService
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Staff ID is missing';
      this.isLoading = false;
      return;
    }

    this.staffService.getStaffById(id).subscribe({
      next: (staff) => {
        this.staff = staff;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load staff details. Please try again.';
        this.isLoading = false;
        console.error('Error loading staff:', error);
      }
    });
  }

  editStaff(): void {
    if (this.staff) {
      this.router.navigate(['/dashboard/staff/edit', this.staff.id]);
    }
  }

  viewSchedule(): void {
    if (this.staff) {
      this.router.navigate(['/dashboard/staff/schedule', this.staff.id]);
    }
  }

  toggleStaffStatus(): void {
    if (!this.staff) return;

    this.staffService.toggleStaffStatus(this.staff.id, !this.staff.isActive).subscribe({
      next: (updatedStaff) => {
        this.staff = updatedStaff;
      },
      error: (error) => {
        console.error('Error toggling staff status:', error);
        // Show error notification
      }
    });
  }

  deleteStaff(): void {
    if (!this.staff || !confirm('Are you sure you want to delete this staff member?')) return;

    this.staffService.deleteStaff(this.staff.id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/staff']);
      },
      error: (error) => {
        console.error('Error deleting staff member:', error);
        // Show error notification
      }
    });
  }

  getWorkingDays(): string {
    if (!this.staff) return '';

    const workingDays = this.staff.workHours
      .filter(wh => wh.isWorking)
      .map(wh => this.staffService.getDayName(wh.dayOfWeek));

    if (workingDays.length === 0) return 'None';
    return workingDays.join(', ');
  }

  getWorkHoursForDay(dayOfWeek: number): WorkHours | undefined {
    return this.staff?.workHours.find(wh => wh.dayOfWeek === dayOfWeek);
  }

  formatTime(time: string | undefined): string {
    if (!time) return 'N/A';
    return this.staffService.formatTime(time);
  }

  getSpecialtiesList(): string {
    if (!this.staff) return '';
    return Array.from(this.staff.specialties).join(', ');
  }

  getFullName(): string {
    if (!this.staff) return '';
    return `${this.staff.firstName} ${this.staff.lastName}`;
  }

  setActiveTab(tab: 'details' | 'schedule' | 'appointments'): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/staff']);
  }
}

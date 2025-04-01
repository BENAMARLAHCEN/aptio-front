// src/app/modules/staff/components/staff-list/staff-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService, Staff } from '../../../../core/services/staff.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html'
})
export class StaffListComponent implements OnInit {
  staff: Staff[] = [];
  filteredStaff: Staff[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Search and filter state
  searchTerm = '';
  searchTerms = new Subject<string>();
  activeFilter: 'all' | 'active' | 'inactive' = 'all';
  positionFilter: string | null = null;
  uniquePositions: string[] = [];

  constructor(
    private staffService: StaffService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStaff();

    // Setup search with debounce
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });
  }

  loadStaff(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.staffService.getStaff().subscribe({
      next: (staff) => {
        this.staff = staff;
        this.extractUniquePositions();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load staff. Please try again.';
        this.isLoading = false;
        console.error('Error loading staff:', error);
      }
    });
  }

  extractUniquePositions(): void {
    const positions = new Set<string>();
    this.staff.forEach(s => positions.add(s.position));
    this.uniquePositions = Array.from(positions);
  }

  applyFilters(): void {
    // First filter by active status
    let result = this.staff;

    if (this.activeFilter !== 'all') {
      const isActive = this.activeFilter === 'active';
      result = result.filter(staff => staff.isActive === isActive);
    }

    // Filter by position
    if (this.positionFilter) {
      result = result.filter(staff => staff.position === this.positionFilter);
    }

    // Then filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(staff =>
        `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchLower) ||
        staff.email.toLowerCase().includes(searchLower) ||
        staff.phone.includes(this.searchTerm) ||
        staff.position.toLowerCase().includes(searchLower) ||
        Array.from(staff.specialties).some(specialty =>
          specialty.toLowerCase().includes(searchLower)
        )
      );
    }

    // Sort results by name
    result.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );

    this.filteredStaff = result;
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerms.next(target.value);
  }

  setActiveFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  setPositionFilter(position: string | null): void {
    this.positionFilter = position;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerms.next('');
    this.activeFilter = 'all';
    this.positionFilter = null;
    this.applyFilters();
  }

  viewStaffDetails(id: string): void {
    this.router.navigate(['/dashboard/staff', id]);
  }

  editStaff(id: string, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing
    this.router.navigate(['/dashboard/staff/edit', id]);
  }

  createStaff(): void {
    this.router.navigate(['/dashboard/staff/new']);
  }

  viewSchedule(id: string, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing
    this.router.navigate(['/dashboard/staff/schedule', id]);
  }

  toggleStaffStatus(id: string, active: boolean, event: Event): void {
    event.stopPropagation(); // Prevent the parent click event from firing

    this.staffService.toggleStaffStatus(id, !active).subscribe({
      next: (updatedStaff) => {
        // Update staff in local array
        const index = this.staff.findIndex(s => s.id === id);
        if (index !== -1) {
          this.staff[index] = updatedStaff;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error toggling staff status:', error);
        // Show error notification
      }
    });
  }

  getFullName(staff: Staff): string {
    return `${staff.firstName} ${staff.lastName}`;
  }

  getSpecialtiesList(staff: Staff): string {
    return Array.from(staff.specialties).join(', ');
  }
}

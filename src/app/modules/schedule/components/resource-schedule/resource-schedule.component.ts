// src/app/modules/schedule/components/resource-schedule/resource-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ScheduleService,
  Resource,
  ScheduleEntry,
  Staff,
  ScheduleSettings
} from '../../../../core/services/schedule.service';

interface ResourceScheduleView {
  resource: Resource;
  entries: ScheduleEntry[];
  staff: Map<string, Staff>;
}

@Component({
  selector: 'app-resource-schedule',
  templateUrl: './resource-schedule.component.html'
})
export class ResourceScheduleComponent implements OnInit {
  selectedDate: Date = new Date();
  resources: Resource[] = [];
  staff: Staff[] = [];
  scheduleEntries: ScheduleEntry[] = [];
  resourceSchedules: ResourceScheduleView[] = [];
  scheduleSettings: ScheduleSettings | null = null;

  isLoading = true;
  errorMessage: string | null = null;
  selectedResourceTypes: string[] = []; // For filtering

  constructor(
    private scheduleService: ScheduleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResourceData();
  }

  loadResourceData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Load schedule settings
    this.scheduleService.getScheduleSettings().subscribe({
      next: (settings) => {
        this.scheduleSettings = settings;

        // Load resources
        this.scheduleService.getResources().subscribe({
          next: (resources) => {
            this.resources = resources.filter(r => r.isAvailable);

            // Extract unique resource types for filtering
            const types = [...new Set(this.resources.map(r => r.type))];

            // If no type is selected for filtering, select all
            if (this.selectedResourceTypes.length === 0) {
              this.selectedResourceTypes = types;
            }

            // Load staff for mapping to schedule entries
            this.scheduleService.getStaff().subscribe({
              next: (staff) => {
                this.staff = staff;

                // Load resource schedule for the selected date
                this.loadResourceSchedule();
              },
              error: (error) => {
                this.errorMessage = 'Failed to load staff data.';
                this.isLoading = false;
                console.error('Error loading staff:', error);
              }
            });
          },
          error: (error) => {
            this.errorMessage = 'Failed to load resources.';
            this.isLoading = false;
            console.error('Error loading resources:', error);
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load schedule settings.';
        this.isLoading = false;
        console.error('Error loading schedule settings:', error);
      }
    });
  }

  loadResourceSchedule(): void {
    const dateStr = this.formatDateYYYYMMDD(this.selectedDate);

    this.scheduleService.getScheduleEntries(dateStr, dateStr).subscribe({
      next: (entries) => {
        this.scheduleEntries = entries;
        this.generateResourceSchedules();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load schedule entries.';
        this.isLoading = false;
        console.error('Error loading schedule entries:', error);
      }
    });
  }

  generateResourceSchedules(): void {
    // Create a map of staff by ID for quick lookup
    const staffMap = new Map<string, Staff>();
    this.staff.forEach(s => staffMap.set(s.id, s));

    // Filter resources by selected types
    const filteredResources = this.resources.filter(r =>
      this.selectedResourceTypes.includes(r.type)
    );

    // Create resource schedule views
    this.resourceSchedules = filteredResources.map(resource => {
      // Find entries for this resource
      const resourceEntries = this.scheduleEntries.filter(e => e.resourceId === resource.id);

      // Create staff map for entries
      const entriesStaffMap = new Map<string, Staff>();
      resourceEntries.forEach(entry => {
        const staff = staffMap.get(entry.staffId);
        if (staff) {
          entriesStaffMap.set(entry.staffId, staff);
        }
      });

      return {
        resource: resource,
        entries: resourceEntries,
        staff: entriesStaffMap
      };
    });

    // Sort entries by start time
    this.resourceSchedules.forEach(rs => {
      rs.entries.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  }

  onDateChange(offset: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    this.selectedDate = newDate;
    this.loadResourceSchedule();
  }

  toggleResourceTypeSelection(type: string): void {
    const index = this.selectedResourceTypes.indexOf(type);
    if (index > -1) {
      // Only remove if not the last selected type
      if (this.selectedResourceTypes.length > 1) {
        this.selectedResourceTypes.splice(index, 1);
      }
    } else {
      this.selectedResourceTypes.push(type);
    }
    this.generateResourceSchedules();
  }

  getUniqueResourceTypes(): string[] {
    return [...new Set(this.resources.map(r => r.type))];
  }

  formatTimeRange(startTime: string, endTime: string): string {
    return `${this.formatTimeForDisplay(startTime)} - ${this.formatTimeForDisplay(endTime)}`;
  }

  formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStaffColor(staffId: string): string {
    const staff = this.staff.find(s => s.id === staffId);
    return staff ? staff.color : '#ccc';
  }

  getEntryTypeClass(type: string): string {
    switch (type) {
      case 'appointment':
        return 'bg-primary-light text-primary';
      case 'break':
        return 'bg-yellow-100 text-yellow-800';
      case 'timeoff':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-light text-neutral-dark';
    }
  }

  viewAppointment(entryId: string): void {
    const entry = this.scheduleEntries.find(e => e.id === entryId);
    if (entry && entry.appointmentId) {
      this.router.navigate(['/dashboard/appointments', entry.appointmentId]);
    }
  }

  createAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
  }
}

// src/

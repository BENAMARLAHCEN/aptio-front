import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService, Resource, ScheduleEntry, Staff } from '../../../../core/services/schedule.service';

@Component({
  selector: 'app-resource-calendar',
  templateUrl: './resource-calendar.component.html'
})
export class ResourceCalendarComponent implements OnInit {
  @Input() resource: Resource | null = null;
  @Input() date: Date = new Date();

  entries: ScheduleEntry[] = [];
  staffMap: Map<string, Staff> = new Map();

  isLoading = true;
  errorMessage: string | null = null;

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    if (this.resource) {
      this.loadResourceEntries();
    }
  }

  loadResourceEntries(): void {
    if (!this.resource) return;

    this.isLoading = true;
    this.errorMessage = null;

    const dateStr = this.formatDateYYYYMMDD(this.date);

    // Load all entries for the date
    this.scheduleService.getScheduleEntries(dateStr, dateStr).subscribe({
      next: (entries) => {
        // Filter entries for this resource
        this.entries = entries.filter(e => e.resourceId === this.resource?.id);

        // Load staff for the entries
        this.loadStaffForEntries();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load schedule entries.';
        this.isLoading = false;
        console.error('Error loading schedule entries:', error);
      }
    });
  }

  loadStaffForEntries(): void {
    // Get unique staff IDs from entries
    const staffIds = [...new Set(this.entries.map(e => e.staffId))];

    if (staffIds.length === 0) {
      this.isLoading = false;
      return;
    }

    this.scheduleService.getStaff().subscribe({
      next: (staff) => {
        // Create map of staff by ID
        this.staffMap = new Map();
        staff.forEach(s => {
          if (staffIds.includes(s.id)) {
            this.staffMap.set(s.id, s);
          }
        });

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load staff data.';
        this.isLoading = false;
        console.error('Error loading staff:', error);
      }
    });
  }

  formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  getStaffName(staffId: string): string {
    const staff = this.staffMap.get(staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff';
  }

  getStaffColor(staffId: string): string {
    const staff = this.staffMap.get(staffId);
    return staff ? staff.color : '#ccc';
  }
}

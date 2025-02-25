// src/app/modules/schedule/components/daily-schedule/daily-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ScheduleService,
  Staff,
  ScheduleEntry,
  ScheduleSettings,
  TimeSlot
} from '../../../../core/services/schedule.service';

interface ScheduleColumn {
  staff: Staff;
  entries: ScheduleEntry[];
}

interface ScheduleTimeSlot {
  time: string;
  displayTime: string;
  isHalfHour: boolean;
  hourLabel: string | null;
}

@Component({
  selector: 'app-daily-schedule',
  templateUrl: './daily-schedule.component.html'
})
export class DailyScheduleComponent implements OnInit {
  selectedDate: Date = new Date();
  staff: Staff[] = [];
  scheduleEntries: ScheduleEntry[] = [];
  scheduleSettings: ScheduleSettings | null = null;
  scheduleColumns: ScheduleColumn[] = [];
  timeSlots: ScheduleTimeSlot[] = [];

  isLoading = true;
  errorMessage: string | null = null;
  selectedStaffIds: string[] = []; // For filtering

  constructor(
    private scheduleService: ScheduleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadScheduleData();
  }

  loadScheduleData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Load schedule settings
    this.scheduleService.getScheduleSettings().subscribe({
      next: (settings) => {
        this.scheduleSettings = settings;

        // Load staff
        this.scheduleService.getStaff().subscribe({
          next: (staff) => {
            this.staff = staff.filter(s => s.isActive);

            // If no staff is selected for filtering, select all
            if (this.selectedStaffIds.length === 0) {
              this.selectedStaffIds = this.staff.map(s => s.id);
            }

            // Load schedule entries for the selected date
            this.loadDailySchedule();
          },
          error: (error) => {
            this.errorMessage = 'Failed to load staff data.';
            this.isLoading = false;
            console.error('Error loading staff:', error);
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

  loadDailySchedule(): void {
    const dateStr = this.formatDateYYYYMMDD(this.selectedDate);

    this.scheduleService.getScheduleEntries(dateStr, dateStr).subscribe({
      next: (entries) => {
        this.scheduleEntries = entries;
        this.generateTimeSlots();
        this.generateScheduleColumns();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load schedule entries.';
        this.isLoading = false;
        console.error('Error loading schedule entries:', error);
      }
    });
  }

  generateTimeSlots(): void {
    if (!this.scheduleSettings) {
      return;
    }

    // Generate time slots from business hours
    const startMinutes = this.parseTimeToMinutes(this.scheduleSettings.businessHours.startTime);
    const endMinutes = this.parseTimeToMinutes(this.scheduleSettings.businessHours.endTime);
    const interval = this.scheduleSettings.timeSlotInterval;

    this.timeSlots = [];

    for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
      const time = this.formatMinutesToTime(minutes);
      const isHalfHour = minutes % 60 === 30;
      const isHour = minutes % 60 === 0;

      this.timeSlots.push({
        time: time,
        displayTime: this.formatTimeForDisplay(time),
        isHalfHour: isHalfHour,
        hourLabel: isHour ? this.formatTimeForDisplay(time) : null
      });
    }
  }

  generateScheduleColumns(): void {
    // Create a column for each selected staff member
    this.scheduleColumns = this.staff
      .filter(s => this.selectedStaffIds.includes(s.id))
      .map(staff => {
        return {
          staff: staff,
          entries: this.scheduleEntries.filter(entry => entry.staffId === staff.id)
        };
      });
  }

  onDateChange(offset: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    this.selectedDate = newDate;
    this.loadDailySchedule();
  }

  toggleStaffSelection(staffId: string): void {
    const index = this.selectedStaffIds.indexOf(staffId);
    if (index > -1) {
      // Only remove if not the last selected staff
      if (this.selectedStaffIds.length > 1) {
        this.selectedStaffIds.splice(index, 1);
      }
    } else {
      this.selectedStaffIds.push(staffId);
    }
    this.generateScheduleColumns();
  }

  selectAllStaff(): void {
    this.selectedStaffIds = this.staff.map(s => s.id);
    this.generateScheduleColumns();
  }

  deselectAllStaff(): void {
    // Keep at least one staff selected
    if (this.staff.length > 0) {
      this.selectedStaffIds = [this.staff[0].id];
    }
    this.generateScheduleColumns();
  }

  getAppointmentStyle(entry: ScheduleEntry, timeSlot: string): any {
    const startMinutes = this.parseTimeToMinutes(entry.startTime);
    const endMinutes = this.parseTimeToMinutes(entry.endTime);
    const slotMinutes = this.parseTimeToMinutes(timeSlot);
    const slotEndMinutes = slotMinutes + this.scheduleSettings!.timeSlotInterval;

    // Check if the appointment overlaps with this time slot
    if (startMinutes < slotEndMinutes && endMinutes > slotMinutes) {
      // Calculate the position and height
      const slotHeight = 48; // Height of each time slot in pixels
      const startOffset = Math.max(0, startMinutes - slotMinutes);
      const duration = Math.min(slotEndMinutes, endMinutes) - Math.max(slotMinutes, startMinutes);

      // Calculate top position as percentage of the slot height
      const topPercentage = (startOffset / this.scheduleSettings!.timeSlotInterval) * 100;
      // Calculate height as percentage of the slot height
      const heightPercentage = (duration / this.scheduleSettings!.timeSlotInterval) * 100;

      const backgroundColor = entry.color || this.getTypeColor(entry.type);

      return {
        'position': 'absolute',
        'top': `${topPercentage}%`,
        'height': `${heightPercentage}%`,
        'width': '90%',
        'left': '5%',
        'background-color': backgroundColor,
        'border-radius': '4px',
        'padding': '4px',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        'font-size': '0.75rem',
        'color': this.getContrastColor(backgroundColor),
        'cursor': 'pointer',
        'z-index': entry.type === 'appointment' ? 20 : 10
      };
    }

    return null;
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'appointment':
        return '#2196F3';
      case 'break':
        return '#FF9800';
      case 'timeoff':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  }

  getContrastColor(hexColor: string): string {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white depending on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
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

  // Format date as YYYY-MM-DD
  formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for display
  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Parse time string (HH:MM) to minutes
  parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Format minutes to time string (HH:MM)
  formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Format time for display
  formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

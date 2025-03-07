// src/app/modules/schedule/components/daily-schedule/daily-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ImprovedScheduleService,
  Staff,
  ScheduleEntry,
  BusinessSettings
} from '../../../../core/services/improved-schedule.service';

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
  businessSettings: BusinessSettings | null = null;
  scheduleColumns: ScheduleColumn[] = [];
  timeSlots: ScheduleTimeSlot[] = [];

  isLoading = true;
  errorMessage: string | null = null;
  selectedStaffIds: string[] = []; // For filtering

  constructor(
    public scheduleService: ImprovedScheduleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadScheduleData();
  }

  loadScheduleData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Load business settings and staff sequentially to avoid Promise.all issues
    this.scheduleService.getBusinessSettings().subscribe({
      next: (settings) => {
        this.businessSettings = settings;

        this.scheduleService.getStaff().subscribe({
          next: (staffMembers) => {
            this.staff = staffMembers.filter(s => s.isActive);

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
            console.error('Error loading staff data:', error);
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load business settings.';
        this.isLoading = false;
        console.error('Error loading business settings:', error);
      }
    });
  }

  loadDailySchedule(): void {
    const dateStr = this.scheduleService.formatDateYYYYMMDD(this.selectedDate);

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
    if (!this.businessSettings) return;

    // Generate time slots from business hours
    const startMinutes = this.scheduleService.parseTimeToMinutes(this.businessSettings.businessHoursStart);
    const endMinutes = this.scheduleService.parseTimeToMinutes(this.businessSettings.businessHoursEnd);
    const interval = this.businessSettings.timeSlotInterval;

    this.timeSlots = [];

    for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
      const time = this.scheduleService.formatMinutesToTime(minutes);
      const isHalfHour = minutes % 60 === 30;
      const isHour = minutes % 60 === 0;

      this.timeSlots.push({
        time: time,
        displayTime: this.scheduleService.formatTimeForDisplay(time),
        isHalfHour: isHalfHour,
        hourLabel: isHour ? this.scheduleService.formatTimeForDisplay(time) : null
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
    if (!this.businessSettings || !entry || !entry.startTime || !entry.endTime || !timeSlot) return null;

    const startMinutes = this.scheduleService.parseTimeToMinutes(entry.startTime);
    const endMinutes = this.scheduleService.parseTimeToMinutes(entry.endTime);
    const slotMinutes = this.scheduleService.parseTimeToMinutes(timeSlot);
    const slotEndMinutes = slotMinutes + this.businessSettings.timeSlotInterval;

    // Check if the appointment overlaps with this time slot
    if (startMinutes < slotEndMinutes && endMinutes > slotMinutes) {
      // Calculate the position and height
      const startOffset = Math.max(0, startMinutes - slotMinutes);
      const duration = Math.min(slotEndMinutes, endMinutes) - Math.max(slotMinutes, startMinutes);

      // Calculate top position as percentage of the slot height
      const topPercentage = (startOffset / this.businessSettings.timeSlotInterval) * 100;
      // Calculate height as percentage of the slot height
      const heightPercentage = (duration / this.businessSettings.timeSlotInterval) * 100;

      const backgroundColor = entry.color || this.getTypeColor(entry.type);

      return {
        'position': 'absolute',
        'top': `${topPercentage}%`,
        'height': `${heightPercentage}%`,
        'width': '90%',
        'left': '5%',
        'backgroundColor': backgroundColor,
        'borderRadius': '4px',
        'padding': '4px',
        'overflow': 'hidden',
        'textOverflow': 'ellipsis',
        'whiteSpace': 'nowrap',
        'fontSize': '0.75rem',
        'color': this.getContrastColor(backgroundColor),
        'cursor': 'pointer',
        'zIndex': entry.type === 'APPOINTMENT' ? 20 : 10
      };
    }

    return null;
  }

  getTypeColor(type: string): string {
    switch (type.toUpperCase()) {
      case 'APPOINTMENT':
        return '#2196F3';
      case 'BREAK':
        return '#FF9800';
      case 'TIMEOFF':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  }

  getContrastColor(hexColor: string): string {
    // Default to white if no color provided
    if (!hexColor || !hexColor.startsWith('#')) return '#FFFFFF';

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

  // Format date for display
  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

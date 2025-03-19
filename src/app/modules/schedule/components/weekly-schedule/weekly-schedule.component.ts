// src/app/modules/schedule/components/weekly-schedule/weekly-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ImprovedScheduleService,
  Staff,
  ScheduleEntry,
  BusinessSettings
} from '../../../../core/services/improved-schedule.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface WeekDay {
  date: Date;
  dayOfWeek: number;
  isToday: boolean;
  dayName: string;
  dateStr: string;
  entries: ScheduleEntry[];
}

@Component({
  selector: 'app-weekly-schedule',
  templateUrl: './weekly-schedule.component.html'
})
export class WeeklyScheduleComponent implements OnInit {
  selectedStaffId: string = '';
  selectedWeekStart: Date = new Date();
  weekDays: WeekDay[] = [];
  staff: Staff[] = [];
  scheduleEntries: ScheduleEntry[] = [];
  businessSettings: BusinessSettings | null = null;

  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    public scheduleService: ImprovedScheduleService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Initialize selected week to start of current week
    this.selectedWeekStart = this.scheduleService.getStartOfWeek(new Date());
  }

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

            // Select first staff member if none selected
            if (!this.selectedStaffId && this.staff.length > 0) {
              this.selectedStaffId = this.staff[0].id;
            }

            // Generate week days
            this.generateWeekDays();

            // Load schedule entries for the selected week
            this.loadWeeklySchedule();
          },
          error: (error) => {
            this.errorMessage = 'Failed to load staff data.';
            this.isLoading = false;
            console.error('Error loading staff data:', error);
            this.notificationService.error('Failed to load staff data. Please try again.');
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load business settings.';
        this.isLoading = false;
        console.error('Error loading business settings:', error);
        this.notificationService.error('Failed to load business settings. Please try again.');
      }
    });
  }

  loadWeeklySchedule(): void {
    if (!this.selectedStaffId) {
      this.isLoading = false;
      return;
    }

    const startDate = this.scheduleService.formatDateYYYYMMDD(this.weekDays[0].date);
    const endDate = this.scheduleService.formatDateYYYYMMDD(this.weekDays[6].date);

    this.scheduleService.getStaffSchedule(this.selectedStaffId, startDate, endDate).subscribe({
      next: (entries) => {
        console.log('Schedule entries:', entries);
        this.scheduleEntries = entries;

        // Assign entries to days
        this.assignEntriesToDays();

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load schedule entries.';
        this.isLoading = false;
        console.error('Error loading schedule entries:', error);
        this.notificationService.error('Failed to load schedule entries. Please try again.');
      }
    });
  }

  generateWeekDays(): void {
    this.weekDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create an array of the 7 days in the selected week
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.selectedWeekStart);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const isToday = date.getTime() === today.getTime();

      this.weekDays.push({
        date: date,
        dayOfWeek: dayOfWeek,
        isToday: isToday,
        dayName: this.scheduleService.getDayName(dayOfWeek),
        dateStr: this.scheduleService.formatDateYYYYMMDD(date),
        entries: []
      });
    }
  }

  assignEntriesToDays(): void {
    // Clear previous entries
    this.weekDays.forEach(day => {
      day.entries = [];
    });

    // Helper function to normalize date string formats
    const normalizeDate = (dateStr: any): string => {
      // Handle multiple date formats - convert to YYYY-MM-DD
      if (!dateStr) return '';

      // If it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }

      // If it's an array or other format, try to convert it
      try {
        // If it's an array like [2023, 3, 15], join with hyphens
        if (Array.isArray(dateStr)) {
          return dateStr.slice(0, 3).
            map(part => String(part).padStart(2, '0')).
          join('-');
        }

        // Try to parse as date object
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return this.scheduleService.formatDateYYYYMMDD(date);
        }
      } catch (err) {
        console.error('Error normalizing date:', dateStr, err);
        this.notificationService.warning('There was an issue processing some dates in the schedule');
      }

      return dateStr; // Return original if nothing works
    };

    // Assign entries to the correct day - with better logging
    let entriesAssigned = 0;
    let entriesSkipped = 0;

    this.scheduleEntries.forEach(entry => {
      const entryDateStr = normalizeDate(entry.date);
      console.log(`Entry date: ${entry.date}, normalized: ${entryDateStr}`);

      // Try to find the matching day
      const day = this.weekDays.find(d => {
        console.log(`Comparing: day ${d.dateStr} with entry ${entryDateStr}`);
        return d.dateStr === entryDateStr;
      });

      if (day) {
        console.log(`Found matching day for entry: ${entry.title}`);
        day.entries.push(entry);
        entriesAssigned++;
      } else {
        console.warn(`No matching day found for entry date: ${entry.date}, normalized: ${entryDateStr}`);
        console.log('Available days:', this.weekDays.map(d => d.dateStr));
        entriesSkipped++;
      }
    });

    // Sort entries by start time
    this.weekDays.forEach(day => {
      day.entries.sort((a, b) => {
        if (!a.startTime) return -1;
        if (!b.startTime) return 1;
        return a.startTime.localeCompare(b.startTime);
      });
    });

    // Notify if entries were skipped
    if (entriesSkipped > 0) {
      this.notificationService.warning(`${entriesSkipped} appointments could not be displayed on the calendar`);
    }

    // Show success message if entries were loaded
    if (entriesAssigned > 0) {
      this.notificationService.success(`Successfully loaded ${entriesAssigned} appointments`);
    } else if (this.scheduleEntries.length > 0 && entriesAssigned === 0) {
      this.notificationService.error('Unable to display any appointments on the calendar');
    }
  }

  onStaffChange(): void {
    this.loadWeeklySchedule();
    // Notify user that staff selection has changed
    const selectedStaff = this.staff.find(s => s.id === this.selectedStaffId);
    if (selectedStaff) {
      this.notificationService.info(`Viewing schedule for ${selectedStaff.firstName} ${selectedStaff.lastName}`);
    }
  }

  changeWeek(offset: number): void {
    const newDate = new Date(this.selectedWeekStart);
    newDate.setDate(newDate.getDate() + (offset * 7));
    this.selectedWeekStart = this.scheduleService.getStartOfWeek(newDate);
    this.generateWeekDays();
    this.loadWeeklySchedule();
  }

  goToToday(): void {
    this.selectedWeekStart = this.scheduleService.getStartOfWeek(new Date());
    this.generateWeekDays();
    this.loadWeeklySchedule();
    // Notify user that we've navigated to today
    this.notificationService.info('Showing schedule for current week');
  }

  getWeekRangeDisplay(): string {
    // Check if weekDays array is populated
    if (!this.weekDays || this.weekDays.length < 7) {
      return 'Loading...';
    }

    try {
      const startDisplay = this.weekDays[0].date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      const endDisplay = this.weekDays[6].date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `${startDisplay} - ${endDisplay}`;
    } catch (err) {
      console.error('Error generating week range display:', err);
      return 'Current Week';
    }
  }

  getDayClass(day: WeekDay): string {
    let classes = 'border border-neutral-light rounded-lg overflow-hidden';

    if (day.isToday) {
      classes += ' border-primary';
    }

    return classes;
  }

  isWorking(day: WeekDay): boolean {
    if (!this.selectedStaffId || !this.businessSettings) {
      return false;
    }

    // Check business days open
    const daysOpen = this.scheduleService.daysOpenStringToArray(this.businessSettings.daysOpen);
    if (!daysOpen[day.dayOfWeek]) {
      return false;
    }

    // Check staff work hours
    const staff = this.staff.find(s => s.id === this.selectedStaffId);
    if (!staff) {
      return false;
    }

    const workHours = staff.workHours.find(wh => wh.dayOfWeek === day.dayOfWeek);
    return workHours ? workHours.isWorking : false;
  }

  getWorkingHours(day: WeekDay): string {
    if (!this.selectedStaffId) {
      return 'Not working';
    }

    const staff = this.staff.find(s => s.id === this.selectedStaffId);
    if (!staff) {
      return 'Not working';
    }

    const workHours = staff.workHours.find(wh => wh.dayOfWeek === day.dayOfWeek);
    if (!workHours || !workHours.isWorking || !workHours.startTime || !workHours.endTime) {
      return 'Not working';
    }

    try {
      return `${this.formatTime(workHours.startTime)} - ${this.formatTime(workHours.endTime)}`;
    } catch (err) {
      console.error('Error formatting working hours:', err);
      return 'Not working';
    }
  }

  formatTimeRange(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '';

    try {
      return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
    } catch (err) {
      console.error('Error formatting time range:', err);
      return `${startTime} - ${endTime}`;
    }
  }

  formatTime(timeString: any): string {
    if (!timeString) return '';

    try {
      // Handle different time formats
      if (Array.isArray(timeString)) {
        // If it's an array like [14, 30]
        const hours = timeString[0];
        const minutes = timeString[1];

        // Create a date object and format it
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (typeof timeString === 'string') {
        // If it's a string like "14:30"
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }

      return String(timeString);
    } catch (err) {
      console.error('Error formatting time:', timeString, err);
      return String(timeString || '');
    }
  }

  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  viewAppointment(entryId: string): void {
    const entry = this.scheduleEntries.find(e => e.id === entryId);
    if (entry && entry.appointmentId) {
      this.router.navigate(['/dashboard/appointments', entry.appointmentId]);
    } else if (entry) {
      this.notificationService.info(`This entry doesn't have an associated appointment.`);
    } else {
      this.notificationService.error(`Could not find the selected schedule entry.`);
    }
  }

  createAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
    this.notificationService.info('Creating a new appointment');
  }
}

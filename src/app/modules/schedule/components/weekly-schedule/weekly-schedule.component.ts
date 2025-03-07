// src/app/modules/schedule/components/weekly-schedule/weekly-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ImprovedScheduleService,
  Staff,
  ScheduleEntry,
  BusinessSettings
} from '../../../../core/services/improved-schedule.service';

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
    private router: Router
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

  loadWeeklySchedule(): void {
    if (!this.selectedStaffId) {
      this.isLoading = false;
      return;
    }

    const startDate = this.scheduleService.formatDateYYYYMMDD(this.weekDays[0].date);
    const endDate = this.scheduleService.formatDateYYYYMMDD(this.weekDays[6].date);

    this.scheduleService.getStaffSchedule(this.selectedStaffId, startDate, endDate).subscribe({
      next: (entries) => {
        this.scheduleEntries = entries;

        // Assign entries to days
        this.assignEntriesToDays();

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load schedule entries.';
        this.isLoading = false;
        console.error('Error loading schedule entries:', error);
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

    // Assign entries to the correct day
    this.scheduleEntries.forEach(entry => {
      const day = this.weekDays.find(d => d.dateStr === entry.date);
      if (day) {
        day.entries.push(entry);
      }
    });

    // Sort entries by start time
    this.weekDays.forEach(day => {
      day.entries.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  }

  onStaffChange(): void {
    this.loadWeeklySchedule();
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
      return `${this.scheduleService.formatTimeForDisplay(workHours.startTime)} - ${this.scheduleService.formatTimeForDisplay(workHours.endTime)}`;
    } catch (err) {
      console.error('Error formatting working hours:', err);
      return 'Not working';
    }
  }

  formatTimeRange(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '';

    try {
      return `${this.scheduleService.formatTimeForDisplay(startTime)} - ${this.scheduleService.formatTimeForDisplay(endTime)}`;
    } catch (err) {
      console.error('Error formatting time range:', err);
      return `${startTime} - ${endTime}`;
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
    }
  }

  createAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ScheduleService,
  Staff,
  ScheduleEntry,
  ScheduleSettings
} from '../../../../core/services/schedule.service';

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
  selectedWeekStart: Date = this.getStartOfWeek(new Date());
  weekDays: WeekDay[] = [];
  staff: Staff[] = [];
  scheduleEntries: ScheduleEntry[] = [];
  scheduleSettings: ScheduleSettings | null = null;

  isLoading = true;
  errorMessage: string | null = null;

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

  loadWeeklySchedule(): void {
    if (!this.selectedStaffId) {
      this.isLoading = false;
      return;
    }

    const startDate = this.formatDateYYYYMMDD(this.weekDays[0].date);
    const endDate = this.formatDateYYYYMMDD(this.weekDays[6].date);

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
        dayName: this.getDayName(dayOfWeek),
        dateStr: this.formatDateYYYYMMDD(date),
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
    this.selectedWeekStart = this.getStartOfWeek(newDate);
    this.generateWeekDays();
    this.loadWeeklySchedule();
  }

  goToToday(): void {
    this.selectedWeekStart = this.getStartOfWeek(new Date());
    this.generateWeekDays();
    this.loadWeeklySchedule();
  }

  getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();

    // Set to previous Sunday (or the current day if it's already Sunday)
    result.setDate(result.getDate() - day);

    // Reset time to start of day
    result.setHours(0, 0, 0, 0);

    return result;
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

  getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getWeekRangeDisplay(): string {
    const startDisplay = this.selectedWeekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const endDate = new Date(this.selectedWeekStart);
    endDate.setDate(endDate.getDate() + 6);

    const endDisplay = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${startDisplay} - ${endDisplay}`;
  }

  getDayClass(day: WeekDay): string {
    let classes = 'border border-neutral-light rounded-lg';

    if (day.isToday) {
      classes += ' border-primary';
    }

    return classes;
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

  isWorking(day: WeekDay): boolean {
    if (!this.selectedStaffId || !this.scheduleSettings) {
      return false;
    }

    // Check business days
    if (!this.scheduleSettings.daysOpen[day.dayOfWeek]) {
      return false;
    }

    // Check staff work hours
    const staff = this.staff.find(s => s.id === this.selectedStaffId);
    if (!staff) {
      return false;
    }

    return staff.workHours[day.dayOfWeek].isWorking;
  }

  getWorkingHours(day: WeekDay): string {
    if (!this.selectedStaffId) {
      return 'Not working';
    }

    const staff = this.staff.find(s => s.id === this.selectedStaffId);
    if (!staff) {
      return 'Not working';
    }

    const workHours = staff.workHours[day.dayOfWeek];
    if (!workHours.isWorking) {
      return 'Not working';
    }

    return `${this.formatTimeForDisplay(workHours.startTime)} - ${this.formatTimeForDisplay(workHours.endTime)}`;
  }
}

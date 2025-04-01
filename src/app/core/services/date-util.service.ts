// src/app/core/services/date-util.service.ts
import { Injectable } from '@angular/core';

/**
 * Central service for date formatting and manipulation operations
 * throughout the application.
 */
@Injectable({
  providedIn: 'root'
})
export class DateUtilService {

  constructor() { }

  /**
   * Format date as YYYY-MM-DD for API requests
   */
  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format date for input fields that expect YYYY-MM-DD
   */
  formatDateForInput(date: Date): string {
    return this.formatDateForAPI(date);
  }

  /**
   * Parse a date array [year, month, day, ...] into a formatted date string
   */
  formatDateFromArray(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) return '';

    const formattedDateParts = dateArray.map((part, index) => {
      // Index 0 is year (keep as is), index 1 is month, index 2 is day (pad these)
      return index > 0 ? part.toString().padStart(2, '0') : part;
    }).join('-');

    return formattedDateParts;
  }

  /**
   * Format date with a long format (e.g., "Wednesday, March 19, 2025")
   */
  formatDateLong(dateString: string | number[] | Date | null | undefined): string {
    if (!dateString) return 'Not provided';

    let date: Date;

    if (dateString instanceof Date) {
      date = dateString;
    } else if (Array.isArray(dateString)) {
      const [year, month, day] = dateString;
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format date with a medium format (e.g., "Mar 19, 2025")
   */
  formatDateMedium(dateString: string | number[] | Date | null | undefined): string {
    if (!dateString) return 'Not provided';

    let date: Date;

    if (dateString instanceof Date) {
      date = dateString;
    } else if (Array.isArray(dateString)) {
      const [year, month, day] = dateString;
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date with a short format (e.g., "3/19/25")
   */
  formatDateShort(dateString: string | number[] | Date | null | undefined): string {
    if (!dateString) return 'Not provided';

    let date: Date;

    if (dateString instanceof Date) {
      date = dateString;
    } else if (Array.isArray(dateString)) {
      const [year, month, day] = dateString;
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric'
    });
  }

  /**
   * Format time string to display nicely (e.g., "2:30 PM")
   */
  formatTime(timeString: any): string {
    if (!timeString) return '';

    try {
      let hours: number;
      let minutes: number;

      if (Array.isArray(timeString)) {
        // Handle format [hours, minutes]
        [hours, minutes] = timeString.map(Number);
      } else if (typeof timeString === 'string' && timeString.includes(':')) {
        // Handle format "HH:MM"
        [hours, minutes] = timeString.split(':').map(Number);
      } else {
        return String(timeString);
      }

      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return String(timeString || '');
    }
  }

  /**
   * Format a time range (start and end times)
   */
  formatTimeRange(startTime: any, endTime: any): string {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  /**
   * Format date and time together
   */
  formatDateTime(dateValue: any, timeValue: any): string {
    const dateStr = this.formatDateMedium(dateValue);
    const timeStr = this.formatTime(timeValue);

    if (dateStr === 'Not provided') return 'Not provided';
    return `${dateStr} at ${timeStr}`;
  }

  /**
   * Calculate end time based on start time and duration
   */
  calculateEndTime(startTime: any, durationMinutes: number): string {
    if (!startTime) return '';

    try {
      let hours: number;
      let minutes: number;

      if (Array.isArray(startTime)) {
        // Handle format [hours, minutes]
        [hours, minutes] = startTime.map(Number);
      } else if (typeof startTime === 'string' && startTime.includes(':')) {
        // Handle format "HH:MM"
        [hours, minutes] = startTime.split(':').map(Number);
      } else {
        return '';
      }

      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + durationMinutes);

      return endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      console.error('Error calculating end time:', error);
      return '';
    }
  }

  /**
   * Format a duration in minutes into a human-readable string
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }

    return hours === 1
      ? `1 hour ${remainingMinutes} min`
      : `${hours} hours ${remainingMinutes} min`;
  }

  /**
   * Get the start of the week (Sunday) for a given date
   */
  getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get the end of the week (Saturday) for a given date
   */
  getEndOfWeek(date: Date): Date {
    const result = this.getStartOfWeek(date);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get day name from day of week number (0 = Sunday, 1 = Monday, etc.)
   */
  getDayName(dayOfWeek: number, format: 'long' | 'short' = 'long'): string {
    const days = {
      long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    return days[format][dayOfWeek];
  }

  /**
   * Get month name from month number (0 = January, 1 = February, etc.)
   */
  getMonthName(month: number, format: 'long' | 'short' = 'long'): string {
    const months = {
      long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    return months[format][month];
  }

  /**
   * Get today's date with time set to midnight
   */
  getTodayStart(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Compare if two dates are the same day (ignoring time)
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /**
   * Check if a date is today
   */
  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Check if a date is in the future
   */
  isFutureDate(date: Date): boolean {
    const today = this.getTodayStart();
    return date.getTime() > today.getTime();
  }

  /**
   * Check if a date is in the past
   */
  isPastDate(date: Date): boolean {
    const today = this.getTodayStart();
    return date.getTime() < today.getTime();
  }

  /**
   * Generate an array of dates for a range
   */
  generateDateRange(startDate: Date, numberOfDays: number): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }

    return dates;
  }

  /**
   * Convert a string to a daysOpen format (e.g., "0111110" for Mon-Fri)
   */
  daysOpenArrayToString(daysOpen: boolean[]): string {
    return daysOpen.map(isOpen => isOpen ? '1' : '0').join('');
  }

  /**
   * Convert a daysOpen string to an array of booleans
   */
  daysOpenStringToArray(daysString: string): boolean[] {
    const result: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      result.push(i < daysString.length ? daysString.charAt(i) === '1' : false);
    }
    return result;
  }

  parseTime(timeString: any): number {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    } catch (error) {
      return 0;
    }
  }
}

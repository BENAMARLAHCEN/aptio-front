
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilService {

  constructor() { }


  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForInput(date: Date): string {
    return this.formatDateForAPI(date);
  }

  formatDateFromArray(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) return '';

    const formattedDateParts = dateArray.map((part, index) => {
      return index > 0 ? part.toString().padStart(2, '0') : part;
    }).join('-');

    return formattedDateParts;
  }

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

  formatTime(timeString: any): string {
    if (!timeString) return '';

    try {
      let hours: number;
      let minutes: number;

      if (Array.isArray(timeString)) {
        [hours, minutes] = timeString.map(Number);
      } else if (typeof timeString === 'string' && timeString.includes(':')) {
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


  formatDateTime(dateValue: any, timeValue: any): string {
    const dateStr = this.formatDateMedium(dateValue);
    const timeStr = this.formatTime(timeValue);

    if (dateStr === 'Not provided') return 'Not provided';
    return `${dateStr} at ${timeStr}`;
  }

  calculateEndTime(startTime: any, durationMinutes: number): string {
    if (!startTime) return '';

    try {
      let hours: number;
      let minutes: number;

      if (Array.isArray(startTime)) {
        [hours, minutes] = startTime.map(Number);
      } else if (typeof startTime === 'string' && startTime.includes(':')) {
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

  getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  getDayName(dayOfWeek: number, format: 'long' | 'short' = 'long'): string {
    const days = {
      long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    return days[format][dayOfWeek];
  }

  getMonthName(month: number, format: 'long' | 'short' = 'long'): string {
    const months = {
      long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    return months[format][month];
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
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

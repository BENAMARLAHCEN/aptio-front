// src/app/core/services/schedule.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Appointment, AppointmentsService } from './appointments.service';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  specialties: string[];
  color: string;
  avatar?: string;
  isActive: boolean;
  workHours: WorkHours[];
}

export interface WorkHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isWorking: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  breaks: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  note?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  isAvailable: boolean;
  color: string;
}

export interface ScheduleSettings {
  businessHours: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  daysOpen: boolean[]; // Array of 7 booleans, index 0 = Sunday, etc.
  defaultAppointmentDuration: number; // in minutes
  timeSlotInterval: number; // in minutes
  allowOverlappingAppointments: boolean;
  bufferTimeBetweenAppointments: number; // in minutes
}

export interface ScheduleEntry {
  id: string;
  staffId: string;
  resourceId?: string;
  appointmentId?: string;
  title: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  notes?: string;
  type: 'appointment' | 'break' | 'timeoff' | 'other';
  status: 'scheduled' | 'completed' | 'cancelled';
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'http://localhost:8080/api/v1';

  // Mock data for demonstration
  private mockStaff: Staff[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      position: 'Senior Stylist',
      specialties: ['Haircut', 'Coloring', 'Styling'],
      color: '#4CAF50',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      isActive: true,
      workHours: [
        { dayOfWeek: 0, isWorking: false, startTime: '', endTime: '', breaks: [] },
        { dayOfWeek: 1, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 2, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 3, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 4, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 5, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 6, isWorking: false, startTime: '', endTime: '', breaks: [] }
      ]
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      phone: '555-234-5678',
      position: 'Nail Technician',
      specialties: ['Manicure', 'Pedicure', 'Nail Art'],
      color: '#2196F3',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      isActive: true,
      workHours: [
        { dayOfWeek: 0, isWorking: false, startTime: '', endTime: '', breaks: [] },
        { dayOfWeek: 1, isWorking: true, startTime: '10:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        { dayOfWeek: 2, isWorking: true, startTime: '10:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        { dayOfWeek: 3, isWorking: false, startTime: '', endTime: '', breaks: [] },
        { dayOfWeek: 4, isWorking: true, startTime: '10:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        { dayOfWeek: 5, isWorking: true, startTime: '10:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        { dayOfWeek: 6, isWorking: true, startTime: '11:00', endTime: '16:00', breaks: [] }
      ]
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      phone: '555-345-6789',
      position: 'Massage Therapist',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Hot Stone'],
      color: '#FF9800',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      isActive: true,
      workHours: [
        { dayOfWeek: 0, isWorking: false, startTime: '', endTime: '', breaks: [] },
        { dayOfWeek: 1, isWorking: true, startTime: '12:00', endTime: '20:00', breaks: [{ startTime: '16:00', endTime: '17:00' }] },
        { dayOfWeek: 2, isWorking: true, startTime: '12:00', endTime: '20:00', breaks: [{ startTime: '16:00', endTime: '17:00' }] },
        { dayOfWeek: 3, isWorking: true, startTime: '12:00', endTime: '20:00', breaks: [{ startTime: '16:00', endTime: '17:00' }] },
        { dayOfWeek: 4, isWorking: true, startTime: '12:00', endTime: '20:00', breaks: [{ startTime: '16:00', endTime: '17:00' }] },
        { dayOfWeek: 5, isWorking: false, startTime: '', endTime: '', breaks: [] },
        { dayOfWeek: 6, isWorking: false, startTime: '', endTime: '', breaks: [] }
      ]
    }
  ];

  private mockResources: Resource[] = [
    {
      id: '1',
      name: 'Room 1',
      type: 'Room',
      capacity: 1,
      isAvailable: true,
      color: '#9C27B0'
    },
    {
      id: '2',
      name: 'Room 2',
      type: 'Room',
      capacity: 2,
      isAvailable: true,
      color: '#E91E63'
    },
    {
      id: '3',
      name: 'Massage Table 1',
      type: 'Equipment',
      capacity: 1,
      isAvailable: true,
      color: '#795548'
    },
    {
      id: '4',
      name: 'Styling Station 1',
      type: 'Station',
      capacity: 1,
      isAvailable: true,
      color: '#607D8B'
    }
  ];

  private mockScheduleEntries: ScheduleEntry[] = [
    {
      id: '1',
      staffId: '1',
      resourceId: '4',
      appointmentId: '1',
      title: 'Haircut - John Doe',
      date: '2025-02-25',
      startTime: '10:00',
      endTime: '10:30',
      type: 'appointment',
      status: 'scheduled',
      color: '#4CAF50'
    },
    {
      id: '2',
      staffId: '2',
      resourceId: '1',
      appointmentId: '2',
      title: 'Manicure - Jane Smith',
      date: '2025-02-25',
      startTime: '11:00',
      endTime: '11:45',
      type: 'appointment',
      status: 'scheduled',
      color: '#2196F3'
    },
    {
      id: '3',
      staffId: '3',
      resourceId: '3',
      appointmentId: '3',
      title: 'Massage - Mike Johnson',
      date: '2025-02-26',
      startTime: '14:00',
      endTime: '15:00',
      type: 'appointment',
      status: 'scheduled',
      color: '#FF9800'
    },
    {
      id: '4',
      staffId: '1',
      title: 'Lunch Break',
      date: '2025-02-25',
      startTime: '12:00',
      endTime: '13:00',
      type: 'break',
      status: 'scheduled'
    },
    {
      id: '5',
      staffId: '2',
      title: 'Lunch Break',
      date: '2025-02-25',
      startTime: '13:00',
      endTime: '14:00',
      type: 'break',
      status: 'scheduled'
    },
    {
      id: '6',
      staffId: '1',
      title: 'Time Off',
      date: '2025-02-27',
      startTime: '09:00',
      endTime: '17:00',
      notes: 'Personal day',
      type: 'timeoff',
      status: 'scheduled'
    }
  ];

  private mockSettings: ScheduleSettings = {
    businessHours: {
      startTime: '09:00',
      endTime: '18:00'
    },
    daysOpen: [false, true, true, true, true, true, true], // Closed on Sundays
    defaultAppointmentDuration: 30,
    timeSlotInterval: 15,
    allowOverlappingAppointments: false,
    bufferTimeBetweenAppointments: 5
  };

  constructor(
    private http: HttpClient,
    private appointmentsService: AppointmentsService
  ) {}

  // Get all staff members
  getStaff(): Observable<Staff[]> {
    // In production: return this.http.get<Staff[]>(`${this.apiUrl}/staff`);
    return of(this.mockStaff).pipe(delay(500));
  }

  // Get staff by ID
  getStaffById(id: string): Observable<Staff> {
    // In production: return this.http.get<Staff>(`${this.apiUrl}/staff/${id}`);
    const staff = this.mockStaff.find(s => s.id === id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    return of(staff).pipe(delay(300));
  }

  // Create new staff
  createStaff(staffData: Partial<Staff>): Observable<Staff> {
    // In production: return this.http.post<Staff>(`${this.apiUrl}/staff`, staffData);

    // Create new staff with mock ID
    const newStaff: Staff = {
      id: (this.mockStaff.length + 1).toString(),
      firstName: staffData.firstName || '',
      lastName: staffData.lastName || '',
      email: staffData.email || '',
      phone: staffData.phone || '',
      position: staffData.position || '',
      specialties: staffData.specialties || [],
      color: staffData.color || '#4CAF50',
      avatar: staffData.avatar,
      isActive: staffData.isActive !== undefined ? staffData.isActive : true,
      workHours: staffData.workHours || [
        { dayOfWeek: 0, isWorking: false, startTime: '', endTime: '', breaks: [] },
        { dayOfWeek: 1, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        { dayOfWeek: 2, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        { dayOfWeek: 3, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        { dayOfWeek: 4, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        { dayOfWeek: 5, isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        { dayOfWeek: 6, isWorking: false, startTime: '', endTime: '', breaks: [] }
      ]
    };

    // Add to mock data
    this.mockStaff.push(newStaff);

    return of(newStaff).pipe(delay(500));
  }

  // Update existing staff
  updateStaff(id: string, staffData: Partial<Staff>): Observable<Staff> {
    // In production: return this.http.put<Staff>(`${this.apiUrl}/staff/${id}`, staffData);

    const index = this.mockStaff.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Staff not found');
    }

    // Update staff in mock data
    const updatedStaff = {
      ...this.mockStaff[index],
      ...staffData
    };

    this.mockStaff[index] = updatedStaff;

    return of(updatedStaff).pipe(delay(500));
  }

  // Get all resources
  getResources(): Observable<Resource[]> {
    // In production: return this.http.get<Resource[]>(`${this.apiUrl}/resources`);
    return of(this.mockResources).pipe(delay(500));
  }

  // Get schedule entries for a date range
  getScheduleEntries(startDate: string, endDate: string): Observable<ScheduleEntry[]> {
    // In production: return this.http.get<ScheduleEntry[]>(`${this.apiUrl}/schedule?startDate=${startDate}&endDate=${endDate}`);

    // Filter entries within date range
    const entries = this.mockScheduleEntries.filter(entry => {
      return entry.date >= startDate && entry.date <= endDate;
    });

    return of(entries).pipe(delay(500));
  }

  // Get schedule entries for a specific staff member
  getStaffSchedule(staffId: string, startDate: string, endDate: string): Observable<ScheduleEntry[]> {
    // In production: return this.http.get<ScheduleEntry[]>(`${this.apiUrl}/staff/${staffId}/schedule?startDate=${startDate}&endDate=${endDate}`);

    // Filter entries for the staff within date range
    const entries = this.mockScheduleEntries.filter(entry => {
      return entry.staffId === staffId && entry.date >= startDate && entry.date <= endDate;
    });

    return of(entries).pipe(delay(500));
  }

  // Create a new schedule entry
  createScheduleEntry(entryData: Partial<ScheduleEntry>): Observable<ScheduleEntry> {
    // In production: return this.http.post<ScheduleEntry>(`${this.apiUrl}/schedule`, entryData);

    // Create new entry with mock ID
    const newEntry: ScheduleEntry = {
      id: (this.mockScheduleEntries.length + 1).toString(),
      staffId: entryData.staffId || '',
      resourceId: entryData.resourceId,
      appointmentId: entryData.appointmentId,
      title: entryData.title || '',
      date: entryData.date || '',
      startTime: entryData.startTime || '',
      endTime: entryData.endTime || '',
      notes: entryData.notes,
      type: entryData.type || 'other',
      status: entryData.status || 'scheduled',
      color: entryData.color
    };

    // Add to mock data
    this.mockScheduleEntries.push(newEntry);

    return of(newEntry).pipe(delay(500));
  }

  // Update an existing schedule entry
  updateScheduleEntry(id: string, entryData: Partial<ScheduleEntry>): Observable<ScheduleEntry> {
    // In production: return this.http.put<ScheduleEntry>(`${this.apiUrl}/schedule/${id}`, entryData);

    const index = this.mockScheduleEntries.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Schedule entry not found');
    }

    // Update entry in mock data
    const updatedEntry = {
      ...this.mockScheduleEntries[index],
      ...entryData
    };

    this.mockScheduleEntries[index] = updatedEntry;

    return of(updatedEntry).pipe(delay(500));
  }

  // Delete a schedule entry
  deleteScheduleEntry(id: string): Observable<void> {
    // In production: return this.http.delete<void>(`${this.apiUrl}/schedule/${id}`);

    const index = this.mockScheduleEntries.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Schedule entry not found');
    }

    // Remove from mock data
    this.mockScheduleEntries.splice(index, 1);

    return of(undefined).pipe(delay(500));
  }

  // Get schedule settings
  getScheduleSettings(): Observable<ScheduleSettings> {
    // In production: return this.http.get<ScheduleSettings>(`${this.apiUrl}/settings/schedule`);
    return of(this.mockSettings).pipe(delay(300));
  }

  // Update schedule settings
  updateScheduleSettings(settings: ScheduleSettings): Observable<ScheduleSettings> {
    // In production: return this.http.put<ScheduleSettings>(`${this.apiUrl}/settings/schedule`, settings);

    // Update mock settings
    this.mockSettings = settings;

    return of(this.mockSettings).pipe(delay(500));
  }

  // Get available staff for a specific time slot
  getAvailableStaff(date: string, startTime: string, endTime: string): Observable<Staff[]> {
    // In production: return this.http.get<Staff[]>(`${this.apiUrl}/staff/available?date=${date}&startTime=${startTime}&endTime=${endTime}`);

    // Filter staff who are working on the given day and time
    const dayOfWeek = new Date(date).getDay();

    const availableStaff = this.mockStaff.filter(staff => {
      // Check if staff is active and working on that day
      if (!staff.isActive || !staff.workHours[dayOfWeek].isWorking) {
        return false;
      }

      // Check if staff's work hours cover the requested time slot
      const workHours = staff.workHours[dayOfWeek];
      if (workHours.startTime > startTime || workHours.endTime < endTime) {
        return false;
      }

      // Check if staff has no conflicting schedule entries
      const conflictingEntries = this.mockScheduleEntries.filter(entry => {
        return entry.staffId === staff.id && entry.date === date &&
          ((entry.startTime < endTime && entry.endTime > startTime));
      });

      return conflictingEntries.length === 0;
    });

    return of(availableStaff).pipe(delay(500));
  }

  // Get available resources for a specific time slot
  getAvailableResources(date: string, startTime: string, endTime: string): Observable<Resource[]> {
    // In production: return this.http.get<Resource[]>(`${this.apiUrl}/resources/available?date=${date}&startTime=${startTime}&endTime=${endTime}`);

    // Filter resources that are available and not booked during the time slot
    const availableResources = this.mockResources.filter(resource => {
      if (!resource.isAvailable) {
        return false;
      }

      // Check if resource has no conflicting schedule entries
      const conflictingEntries = this.mockScheduleEntries.filter(entry => {
        return entry.resourceId === resource.id && entry.date === date &&
          ((entry.startTime < endTime && entry.endTime > startTime));
      });

      return conflictingEntries.length === 0;
    });

    return of(availableResources).pipe(delay(500));
  }

  // Helper method to check if a time slot is available for a staff
  isTimeSlotAvailable(staffId: string, date: string, startTime: string, endTime: string): Observable<boolean> {
    // In production: return this.http.get<boolean>(`${this.apiUrl}/staff/${staffId}/available?date=${date}&startTime=${startTime}&endTime=${endTime}`);

    // Check if staff is working during that time
    const staff = this.mockStaff.find(s => s.id === staffId);
    if (!staff) {
      return of(false).pipe(delay(300));
    }

    const dayOfWeek = new Date(date).getDay();
    const workHours = staff.workHours[dayOfWeek];

    if (!workHours.isWorking || workHours.startTime > startTime || workHours.endTime < endTime) {
      return of(false).pipe(delay(300));
    }

    // Check if staff has no conflicting entries
    const conflictingEntries = this.mockScheduleEntries.filter(entry => {
      return entry.staffId === staffId && entry.date === date &&
        ((entry.startTime < endTime && entry.endTime > startTime));
    });

    return of(conflictingEntries.length === 0).pipe(delay(300));
  }

  // Generate time slots based on settings
  generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
    const timeSlots: string[] = [];

    let currentTime = this.parseTime(startTime);
    const endTimeMinutes = this.parseTime(endTime);

    while (currentTime < endTimeMinutes) {
      timeSlots.push(this.formatTime(currentTime));
      currentTime += intervalMinutes;
    }

    return timeSlots;
  }

  // Helper method to parse time string into minutes
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper method to format minutes into time string
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

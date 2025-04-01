// src/app/modules/booking/components/time-slot-selection/time-slot-selection.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService, Service } from '../../../../core/services/services.service';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { DateUtilService } from '../../../../core/services/date-util.service';

@Component({
  selector: 'app-time-slot-selection',
  templateUrl: './time-slot-selection.component.html'
})
export class TimeSlotSelectionComponent implements OnInit {
  serviceId: string | null = null;
  selectedService: Service | null = null;

  availableDates: Date[] = [];
  selectedDate: Date | null = null;

  availableTimeSlots: string[] = [];
  selectedTimeSlot: string | null = null;

  isLoadingService = true;
  isLoadingTimeSlots = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private appointmentsService: AppointmentsService,
    private dateUtilService: DateUtilService
  ) {}

  ngOnInit(): void {
    this.initialize();
  }

  initialize(): void {
    this.isLoadingService = true;
    this.errorMessage = null;

    // Get service ID from route parameter
    this.serviceId = this.route.snapshot.paramMap.get('serviceId');
    if (!this.serviceId) {
      this.errorMessage = 'Service ID is missing';
      this.isLoadingService = false;
      return;
    }

    // Load service details
    this.servicesService.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        this.selectedService = service;
        this.isLoadingService = false;
        this.generateAvailableDates();
      },
      error: (error) => {
        console.error('Error loading service details:', error);
        this.errorMessage = 'Failed to load service details. Please try again.';
        this.isLoadingService = false;
      }
    });
  }

  generateAvailableDates(): void {
    // Generate dates for the next 14 days
    const dates: Date[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    this.availableDates = dates;
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.selectedTimeSlot = null;
    this.loadAvailableTimeSlots();
  }

  loadAvailableTimeSlots(): void {
    if (!this.selectedDate || !this.serviceId) return;

    this.isLoadingTimeSlots = true;

    // Format date as YYYY-MM-DD
    const formattedDate = this.dateUtilService.formatDateForAPI(this.selectedDate);

    this.appointmentsService.getAvailableTimeSlots(formattedDate, this.serviceId).subscribe({
      next: (timeSlots) => {
        this.availableTimeSlots = timeSlots;
        this.isLoadingTimeSlots = false;
      },
      error: (error) => {
        console.error('Error loading available time slots:', error);
        this.errorMessage = 'Failed to load available time slots. Please try again.';
        this.isLoadingTimeSlots = false;
      }
    });
  }

  selectTimeSlot(timeSlot: string): void {
    this.selectedTimeSlot = timeSlot;
  }

  proceedToConfirmation(): void {
    if (!this.selectedDate || !this.selectedTimeSlot || !this.serviceId) return;

    const formattedDate = this.dateUtilService.formatDateForAPI(this.selectedDate);
    const encodedTime = encodeURIComponent(this.selectedTimeSlot);

    this.router.navigate(['/dashboard/booking/confirm', this.serviceId, formattedDate, encodedTime]);
  }

  isDateSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.toDateString() === this.selectedDate.toDateString();
  }

  getWeekday(date: Date): string {
    return this.dateUtilService.getDayName(date.getDay());
  }

  getDay(date: Date): string {
    return date.getDate().toString();
  }

  getMonth(date: Date): string {
    return this.dateUtilService.getMonthName(date.getMonth());
  }

  formatTime(timeString: string): string {
    return this.dateUtilService.formatTime(timeString);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/booking/service']);
  }
}

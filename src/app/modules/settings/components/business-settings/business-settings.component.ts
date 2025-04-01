// src/app/modules/settings/components/business-settings/business-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, BusinessSettings } from '../../../../core/services/settings.service';
import { DateUtilService } from '../../../../core/services/date-util.service';

@Component({
  selector: 'app-business-settings',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-neutral-dark">Business Settings</h1>
        <button (click)="goToMainSettings()" class="btn btn-primary">
          Edit Settings
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
        {{ errorMessage }}
        <button (click)="loadSettings()" class="ml-2 text-primary hover:underline">Try Again</button>
      </div>

      <!-- Settings View -->
      <div *ngIf="!isLoading && settings" class="bg-white rounded-card shadow-card p-6">
        <div class="space-y-6">
          <!-- Business Information -->
          <div>
            <h2 class="text-lg font-medium text-neutral-dark mb-4">Business Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p class="text-sm text-neutral mb-1">Business Name</p>
                <p class="font-medium">{{ settings.businessName }}</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Business Address</p>
                <p class="font-medium">{{ settings.address || 'Not set' }}</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Business Phone</p>
                <p class="font-medium">{{ settings.phone || 'Not set' }}</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Business Email</p>
                <p class="font-medium">{{ settings.email || 'Not set' }}</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Business Website</p>
                <p class="font-medium">{{ settings.website || 'Not set' }}</p>
              </div>
            </div>
          </div>

          <!-- Business Hours -->
          <div class="pt-6 border-t border-neutral-light">
            <h2 class="text-lg font-medium text-neutral-dark mb-4">Business Hours</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral mb-1">Hours of Operation</p>
                <p class="font-medium">{{ formatTime(settings.businessHoursStart) }} - {{ formatTime(settings.businessHoursEnd) }}</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Days Open</p>
                <div class="flex flex-wrap gap-2">
                  <ng-container *ngFor="let day of daysOfWeek; let i = index">
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      [ngClass]="daysOpenArray[i] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ day }}
                    </span>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>

          <!-- Appointment Settings -->
          <div class="pt-6 border-t border-neutral-light">
            <h2 class="text-lg font-medium text-neutral-dark mb-4">Appointment Settings</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p class="text-sm text-neutral mb-1">Default Appointment Duration</p>
                <p class="font-medium">{{ settings.defaultAppointmentDuration }} minutes</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Time Slot Interval</p>
                <p class="font-medium">{{ settings.timeSlotInterval }} minutes</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Buffer Time Between Appointments</p>
                <p class="font-medium">{{ settings.bufferTimeBetweenAppointments }} minutes</p>
              </div>

              <div>
                <p class="text-sm text-neutral mb-1">Allow Overlapping Appointments</p>
                <p class="font-medium">{{ settings.allowOverlappingAppointments ? 'Yes' : 'No' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BusinessSettingsComponent implements OnInit {
  settings: BusinessSettings | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  daysOfWeek = this.settingsService.getDaysOfWeek();
  daysOpenArray: boolean[] = [];

  constructor(
    private settingsService: SettingsService,
    private router: Router,
    private dateUtilService: DateUtilService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.settingsService.getBusinessSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.daysOpenArray = this.settingsService.daysOpenStringToArray(settings.daysOpen);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading business settings:', error);
        this.errorMessage = 'Failed to load business settings. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goToMainSettings(): void {
    this.router.navigate(['/dashboard/settings']);
  }

  formatTime(time: string): string {
    return this.dateUtilService.formatTime(time);
  }
}

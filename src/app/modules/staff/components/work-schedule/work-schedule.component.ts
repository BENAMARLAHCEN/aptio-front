// src/app/modules/staff/components/work-schedule/work-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService, Staff, WorkHours, TimeSlot } from '../../../../core/services/staff.service';

@Component({
  selector: 'app-work-schedule',
  templateUrl: './work-schedule.component.html'
})
export class WorkScheduleComponent implements OnInit {
  scheduleForm: FormGroup;
  staff: Staff | null = null;
  staffId: string | null = null;

  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  daysOfWeek = [
    { value: 0, name: 'Sunday' },
    { value: 1, name: 'Monday' },
    { value: 2, name: 'Tuesday' },
    { value: 3, name: 'Wednesday' },
    { value: 4, name: 'Thursday' },
    { value: 5, name: 'Friday' },
    { value: 6, name: 'Saturday' }
  ];

  // Time slot options for quick selection
  timeOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form with empty schedule
    this.scheduleForm = this.fb.group({
      workHours: this.fb.array([])
    });

    // Generate time options in 30-minute increments
    this.generateTimeOptions();
  }

  ngOnInit(): void {
    this.staffId = this.route.snapshot.paramMap.get('id');
    if (!this.staffId) {
      this.errorMessage = 'Staff ID is missing';
      this.isLoading = false;
      return;
    }

    this.loadStaff(this.staffId);
  }

  loadStaff(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.staffService.getStaffById(id).subscribe({
      next: (staff) => {
        this.staff = staff;
        this.initScheduleForm(staff.workHours || []);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load staff details. Please try again.';
        this.isLoading = false;
        console.error('Error loading staff:', error);
      }
    });
  }

  initScheduleForm(workHours: WorkHours[]): void {
    // Clear existing workHours array
    while (this.workHoursArray.length) {
      this.workHoursArray.removeAt(0);
    }

    // Create form groups for each day of the week
    this.daysOfWeek.forEach(day => {
      const dayWorkHours = workHours.find(wh => wh.dayOfWeek === day.value);

      const workHoursGroup = this.fb.group({
        id: [dayWorkHours?.id || null],
        dayOfWeek: [day.value],
        isWorking: [dayWorkHours?.isWorking || false],
        startTime: [{
          value: dayWorkHours?.startTime || '09:00',
          disabled: !(dayWorkHours?.isWorking || false)
        }],
        endTime: [{
          value: dayWorkHours?.endTime || '17:00',
          disabled: !(dayWorkHours?.isWorking || false)
        }],
        breaks: this.fb.array([])
      });

      // Add breaks
      const breaksArray = workHoursGroup.get('breaks') as FormArray;
      if (dayWorkHours?.breaks && dayWorkHours.breaks.length > 0) {
        dayWorkHours.breaks.forEach(breakSlot => {
          breaksArray.push(this.createBreakGroup(breakSlot));
        });
      }

      this.workHoursArray.push(workHoursGroup);
    });
  }

  createBreakGroup(breakSlot?: TimeSlot): FormGroup {
    return this.fb.group({
      id: [breakSlot?.id || null],
      startTime: [breakSlot?.startTime || '12:00'],
      endTime: [breakSlot?.endTime || '13:00'],
      note: [breakSlot?.note || 'Break']
    });
  }

  get workHoursArray(): FormArray {
    return this.scheduleForm.get('workHours') as FormArray;
  }

  getBreaksArray(dayIndex: number): FormArray {
    return this.workHoursArray.at(dayIndex).get('breaks') as FormArray;
  }

  onIsWorkingChange(dayIndex: number): void {
    const workHoursGroup = this.workHoursArray.at(dayIndex);
    const isWorking = workHoursGroup.get('isWorking')?.value;

    if (isWorking) {
      workHoursGroup.get('startTime')?.enable();
      workHoursGroup.get('endTime')?.enable();
    } else {
      workHoursGroup.get('startTime')?.disable();
      workHoursGroup.get('endTime')?.disable();
      // Clear breaks when not working
      const breaksArray = this.getBreaksArray(dayIndex);
      while (breaksArray.length > 0) {
        breaksArray.removeAt(0);
      }
    }
  }

  addBreak(dayIndex: number): void {
    const breaksArray = this.getBreaksArray(dayIndex);
    breaksArray.push(this.createBreakGroup());
  }

  removeBreak(dayIndex: number, breakIndex: number): void {
    const breaksArray = this.getBreaksArray(dayIndex);
    breaksArray.removeAt(breakIndex);
  }

  onSubmit(): void {
    if (this.scheduleForm.valid && this.staffId) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Prepare work hours data from form
      const workHoursData: WorkHours[] = this.scheduleForm.value.workHours.map((wh: any) => {
        // Only include details if isWorking is true
        if (wh.isWorking) {
          return {
            id: wh.id,
            dayOfWeek: wh.dayOfWeek,
            isWorking: wh.isWorking,
            startTime: wh.startTime,
            endTime: wh.endTime,
            breaks: wh.breaks || []
          };
        } else {
          return {
            id: wh.id,
            dayOfWeek: wh.dayOfWeek,
            isWorking: false,
            breaks: []
          };
        }
      });

      this.staffService.updateWorkHours(this.staffId, workHoursData).subscribe({
        next: () => {
          this.successMessage = 'Schedule updated successfully!';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/dashboard/staff', this.staffId]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update schedule. Please try again.';
          this.isSubmitting = false;
          console.error('Error updating schedule:', error);
        }
      });
    }
  }

  generateTimeOptions(): void {
    // Generate time options from 00:00 to 23:30 in 30-minute increments
    for (let hour = 0; hour < 24; hour++) {
      this.timeOptions.push(`${hour.toString().padStart(2, '0')}:00`);
      this.timeOptions.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  formatTime(time: string): string {
    return this.staffService.formatTime(time);
  }

  cancel(): void {
    if (this.staffId) {
      this.router.navigate(['/dashboard/staff', this.staffId]);
    } else {
      this.router.navigate(['/dashboard/staff']);
    }
  }
}

// src/app/modules/schedule/schedule.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { DailyScheduleComponent } from './components/daily-schedule/daily-schedule.component';
import { WeeklyScheduleComponent } from './components/weekly-schedule/weekly-schedule.component';
import { ResourceScheduleComponent } from './components/resource-schedule/resource-schedule.component';
import { ScheduleSettingsComponent } from './components/schedule-settings/schedule-settings.component';
import { ResourceCalendarComponent } from './components/resource-calendar/resource-calendar.component';

@NgModule({
  declarations: [
    ScheduleComponent,
    DailyScheduleComponent,
    WeeklyScheduleComponent,
    ResourceScheduleComponent,
    ScheduleSettingsComponent,
    ResourceCalendarComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ScheduleRoutingModule
  ]
})
export class ScheduleModule { }

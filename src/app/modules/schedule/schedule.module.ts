// src/app/modules/schedule/schedule.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { WeeklyScheduleComponent } from './components/weekly-schedule/weekly-schedule.component';
import { ImprovedScheduleService } from '../../core/services/improved-schedule.service';

@NgModule({
  declarations: [
    ScheduleComponent,
    WeeklyScheduleComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ScheduleRoutingModule
  ],
  providers: [
    ImprovedScheduleService
  ]
})
export class ScheduleModule { }

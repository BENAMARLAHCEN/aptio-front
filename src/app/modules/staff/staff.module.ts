// src/app/modules/staff/staff.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { StaffRoutingModule } from './staff-routing.module';
import { StaffListComponent } from './components/staff-list/staff-list.component';
import { StaffDetailsComponent } from './components/staff-details/staff-details.component';
import { StaffFormComponent } from './components/staff-form/staff-form.component';
import { WorkScheduleComponent } from './components/work-schedule/work-schedule.component';

@NgModule({
  declarations: [
    StaffListComponent,
    StaffDetailsComponent,
    StaffFormComponent,
    WorkScheduleComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    StaffRoutingModule
  ]
})
export class StaffModule { }

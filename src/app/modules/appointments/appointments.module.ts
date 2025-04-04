import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from "@angular/material/menu";

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentsListComponent } from './components/appointments-list/appointments-list.component';
import { AppointmentDetailsComponent } from './components/appointment-details/appointment-details.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar.component';
import { DateUtilService } from '../../core/services/date-util.service';

@NgModule({
  declarations: [
    AppointmentsListComponent,
    AppointmentDetailsComponent,
    AppointmentFormComponent,
    AppointmentCalendarComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppointmentsRoutingModule,
    FormsModule,
    MatMenuModule
  ],
  providers: [
    DateUtilService
  ]
})
export class AppointmentsModule { }

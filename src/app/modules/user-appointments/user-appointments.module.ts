// src/app/modules/user-appointments/user-appointments.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserAppointmentsRoutingModule } from './user-appointments-routing.module';
import { UserAppointmentsComponent } from './components/user-appointments/user-appointments.component';
import { UserAppointmentDetailsComponent } from './components/user-appointment-details/user-appointment-details.component';

@NgModule({
  declarations: [
    UserAppointmentsComponent,
    UserAppointmentDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserAppointmentsRoutingModule
  ]
})
export class UserAppointmentsModule { }

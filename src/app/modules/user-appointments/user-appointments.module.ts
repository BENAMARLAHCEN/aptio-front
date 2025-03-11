// src/app/modules/user-appointments/user-appointments.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UserAppointmentsRoutingModule } from './user-appointments-routing.module';
import { UserAppointmentsListComponent } from './components/user-appointments-list/user-appointments-list.component';
import { UserAppointmentDetailsComponent } from './components/user-appointment-details/user-appointment-details.component';

@NgModule({
  declarations: [
    UserAppointmentsListComponent,
    UserAppointmentDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    UserAppointmentsRoutingModule
  ]
})
export class UserAppointmentsModule { }

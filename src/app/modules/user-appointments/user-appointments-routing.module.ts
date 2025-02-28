// src/app/modules/user-appointments/user-appointments-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserAppointmentsComponent } from './components/user-appointments/user-appointments.component';
import { UserAppointmentDetailsComponent } from './components/user-appointment-details/user-appointment-details.component';

const routes: Routes = [
  { path: '', component: UserAppointmentsComponent },
  { path: ':id', component: UserAppointmentDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserAppointmentsRoutingModule { }

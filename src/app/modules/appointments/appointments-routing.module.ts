import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsListComponent } from './components/appointments-list/appointments-list.component';
import { AppointmentDetailsComponent } from './components/appointment-details/appointment-details.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar.component';

const routes: Routes = [
  { path: '', component: AppointmentsListComponent },
  { path: 'calendar', component: AppointmentCalendarComponent },
  { path: 'new', component: AppointmentFormComponent },
  { path: 'edit/:id', component: AppointmentFormComponent },
  { path: ':id', component: AppointmentDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }

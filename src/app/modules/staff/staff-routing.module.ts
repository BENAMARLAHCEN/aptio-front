// src/app/modules/staff/staff-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffListComponent } from './components/staff-list/staff-list.component';
import { StaffDetailsComponent } from './components/staff-details/staff-details.component';
import { StaffFormComponent } from './components/staff-form/staff-form.component';
import { WorkScheduleComponent } from './components/work-schedule/work-schedule.component';

const routes: Routes = [
  { path: '', component: StaffListComponent },
  { path: 'new', component: StaffFormComponent },
  { path: 'edit/:id', component: StaffFormComponent },
  { path: 'schedule/:id', component: WorkScheduleComponent },
  { path: ':id', component: StaffDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }

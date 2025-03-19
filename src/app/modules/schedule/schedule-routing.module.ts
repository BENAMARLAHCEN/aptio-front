// src/app/modules/schedule/schedule-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { WeeklyScheduleComponent } from './components/weekly-schedule/weekly-schedule.component';

const routes: Routes = [
  {
    path: '',
    component: ScheduleComponent,
    children: [
      { path: '', component: WeeklyScheduleComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule { }

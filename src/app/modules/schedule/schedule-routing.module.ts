// src/app/modules/schedule/schedule-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { DailyScheduleComponent } from './components/daily-schedule/daily-schedule.component';
import { WeeklyScheduleComponent } from './components/weekly-schedule/weekly-schedule.component';
import { ResourceScheduleComponent } from './components/resource-schedule/resource-schedule.component';
import { ScheduleSettingsComponent } from './components/schedule-settings/schedule-settings.component';

const routes: Routes = [
  {
    path: '',
    component: ScheduleComponent,
    children: [
      { path: '', redirectTo: 'daily', pathMatch: 'full' },
      { path: 'daily', component: DailyScheduleComponent },
      { path: 'weekly', component: WeeklyScheduleComponent },
      { path: 'resources', component: ResourceScheduleComponent },
      { path: 'settings', component: ScheduleSettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule { }

// src/app/modules/dashboard/dashboard-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      {
        path: 'appointments',
        loadChildren: () => import('../appointments/appointments.module').then(m => m.AppointmentsModule),
        data: { roles: ['ROLE_ADMIN', 'ROLE_STAFF'] }
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'customers',
        loadChildren: () => import('../customers/customers.module').then(m => m.CustomersModule),
        data: { roles: ['ROLE_ADMIN', 'ROLE_STAFF'] }
      },
      {
        path: 'services',
        loadChildren: () => import('../services/services.module').then(m => m.ServicesModule),
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'schedule',
        loadChildren: () => import('../schedule/schedule.module').then(m => m.ScheduleModule),
        data: { roles: ['ROLE_ADMIN', 'ROLE_STAFF'] }
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule),
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'my-appointments',
        loadChildren: () => import('../user-appointments/user-appointments.module').then(m => m.UserAppointmentsModule),
        data: { roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_STAFF'] }
      },
      { path: 'staff',
        loadChildren: () => import('../staff/staff.module').then(m => m.StaffModule) ,
        data: { roles: ['ROLE_ADMIN'] }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }

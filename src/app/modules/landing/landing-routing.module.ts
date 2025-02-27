// src/app/modules/landing/landing-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingLayoutComponent } from './components/landing-layout/landing-layout.component';
import { HomeComponent } from './components/home/home.component';
import { ServiceListComponent } from './components/service-list/service-list.component';
import { ServiceDetailsComponent } from './components/service-details/service-details.component';
import { BookingComponent } from './components/booking/booking.component';

const routes: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'services', component: ServiceListComponent },
      { path: 'services/:id', component: ServiceDetailsComponent },
      { path: 'booking', component: BookingComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }

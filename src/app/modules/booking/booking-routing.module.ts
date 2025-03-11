// src/app/modules/booking/booking-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingComponent } from './components/booking/booking.component';
import { ServiceSelectionComponent } from './components/service-selection/service-selection.component';
import { TimeSlotSelectionComponent } from './components/time-slot-selection/time-slot-selection.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';

const routes: Routes = [
  {
    path: '',
    component: BookingComponent,
    children: [
      { path: '', redirectTo: 'service', pathMatch: 'full' },
      { path: 'service', component: ServiceSelectionComponent },
      { path: 'time/:serviceId', component: TimeSlotSelectionComponent },
      { path: 'confirm/:serviceId/:date/:time', component: BookingConfirmationComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }

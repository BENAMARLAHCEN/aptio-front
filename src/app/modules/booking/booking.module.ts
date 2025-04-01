// src/app/modules/booking/booking.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingComponent } from './components/booking/booking.component';
import { ServiceSelectionComponent } from './components/service-selection/service-selection.component';
import { TimeSlotSelectionComponent } from './components/time-slot-selection/time-slot-selection.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';

@NgModule({
  declarations: [
    BookingComponent,
    ServiceSelectionComponent,
    TimeSlotSelectionComponent,
    BookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BookingRoutingModule
  ]
})
export class BookingModule { }

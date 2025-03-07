// src/app/modules/booking/booking.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingComponent } from './components/booking/booking.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';

@NgModule({
  declarations: [
    BookingComponent,
    BookingConfirmationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BookingRoutingModule
  ]
})
export class BookingModule { }

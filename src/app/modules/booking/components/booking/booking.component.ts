// src/app/modules/booking/components/booking/booking.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html'
})
export class BookingComponent {
  // Method to determine if step is active based on the current URL
  isStepActive(step: number): boolean {
    const currentUrl = window.location.pathname;

    if (step === 1) {
      return currentUrl.includes('/booking/service');
    } else if (step === 2) {
      return currentUrl.includes('/booking/time/');
    } else if (step === 3) {
      return currentUrl.includes('/booking/confirm/');
    }

    return false;
  }
}

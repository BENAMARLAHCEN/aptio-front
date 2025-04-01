// src/app/shared/components/forbidden/forbidden.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forbidden.component.html',
  providers: [AuthService]
})
export class ForbiddenComponent {
  constructor(private authService: AuthService) {}

  getDashboardRoute(): string {
    return this.authService.getHomeRouteBasedOnRole();
  }
}

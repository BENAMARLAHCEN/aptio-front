// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
      private authService: AuthService,
      private router: Router
  ) {}

  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      // Check for required roles if specified in route data
      if (route.data && route.data['roles']) {
        const requiredRoles = route.data['roles'] as string[];
        const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));

        if (!hasRequiredRole) {
          // User doesn't have any of the required roles
          this.router.navigate(['/forbidden']);
          return false;
        }
      }

      return true;
    }

    // Not logged in, redirect to login page with return URL
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}

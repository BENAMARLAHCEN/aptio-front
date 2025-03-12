// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 0) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          } else if (error.status === 404) {
            errorMessage = 'The requested resource was not found.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to access this resource.';
          } else if (error.status === 401) {
            errorMessage = 'Authentication failed. Please login again.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `Server error: ${error.status} ${error.statusText || ''}`;
          }
        }

        // Only show notification for non-401 errors as these are handled in auth interceptor
        if (error.status !== 401) {
          this.notificationService.error(errorMessage);
        }

        return throwError(() => error);
      })
    );
  }
}

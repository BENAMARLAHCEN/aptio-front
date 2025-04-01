import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface DashboardStats {
  totalAppointments: number;
  newCustomers: number;
  utilizationRate: number;
  averageFeedback: number;
  recentAppointments: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load dashboard statistics. Please try again.');
        return throwError(() => error);
      })
    );
  }


}

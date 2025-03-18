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

  /**
   * Get dashboard statistics including appointment counts, customer counts, etc.
   * @returns Observable with dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load dashboard statistics. Please try again.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get recent appointments for the dashboard
   * @param limit Number of appointments to return
   * @returns Observable with list of appointments
   */
  getRecentAppointments(limit: number = 5): Observable<any[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<any[]>(`${this.apiUrl}/appointments?date=${today}`).pipe(
      map(appointments => appointments.slice(0, limit)),
      catchError(error => {
        this.notificationService.error('Failed to load recent appointments. Please try again.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get upcoming appointments for the next week
   * @returns Observable with list of appointments
   */
  getUpcomingAppointments(): Observable<any[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const startDate = today.toISOString().split('T')[0];
    const endDate = nextWeek.toISOString().split('T')[0];

    return this.http.get<any[]>(`${this.apiUrl}/appointments?startDate=${startDate}&endDate=${endDate}`).pipe(
      catchError(error => {
        this.notificationService.error('Failed to load upcoming appointments. Please try again.');
        return throwError(() => error);
      })
    );
  }
}

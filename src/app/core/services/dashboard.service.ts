// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics including appointment counts, customer counts, etc.
   * @returns Observable with dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`).pipe(
      catchError(this.handleError<DashboardStats>('getDashboardStats', {
        totalAppointments: 0,
        newCustomers: 0,
        utilizationRate: 0,
        averageFeedback: 0,
        recentAppointments: []
      }))
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
      catchError(this.handleError<any[]>('getRecentAppointments', []))
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
      catchError(this.handleError<any[]>('getUpcomingAppointments', []))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}

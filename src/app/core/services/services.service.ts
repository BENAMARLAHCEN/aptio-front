// src/app/core/services/services.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  active: boolean;
  imageUrl?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  servicesCount: number;
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`)
      .pipe(catchError(this.handleError<Service[]>('getServices', [])));
  }

  // Get service by ID
  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}`)
      .pipe(catchError(this.handleError<Service>('getServiceById')));
  }

  // Create new service
  createService(serviceData: ServiceFormData): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/services`, serviceData)
      .pipe(catchError(this.handleError<Service>('createService')));
  }

  // Update existing service
  updateService(id: string, serviceData: ServiceFormData): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/services/${id}`, serviceData)
      .pipe(catchError(this.handleError<Service>('updateService')));
  }

  // Delete service
  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${id}`)
      .pipe(catchError(this.handleError<any>('deleteService')));
  }

  // Toggle service active status
  toggleServiceStatus(id: string): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/services/${id}/status`, {})
      .pipe(catchError(this.handleError<Service>('toggleServiceStatus')));
  }

  // Get services by category
  getServicesByCategory(category: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services?category=${category}`)
      .pipe(catchError(this.handleError<Service[]>('getServicesByCategory', [])));
  }

  // Search services
  searchServices(query: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services?search=${query}`)
      .pipe(catchError(this.handleError<Service[]>('searchServices', [])));
  }

  // Get all categories
  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.apiUrl}/service-categories`)
      .pipe(catchError(this.handleError<ServiceCategory[]>('getCategories', [])));
  }

  // Get category by ID
  getCategoryById(id: string): Observable<ServiceCategory> {
    return this.http.get<ServiceCategory>(`${this.apiUrl}/service-categories/${id}`)
      .pipe(catchError(this.handleError<ServiceCategory>('getCategoryById')));
  }

  // Create new category
  createCategory(categoryData: Partial<ServiceCategory>): Observable<ServiceCategory> {
    return this.http.post<ServiceCategory>(`${this.apiUrl}/service-categories`, categoryData)
      .pipe(catchError(this.handleError<ServiceCategory>('createCategory')));
  }

  // Update category
  updateCategory(id: string, categoryData: Partial<ServiceCategory>): Observable<ServiceCategory> {
    return this.http.put<ServiceCategory>(`${this.apiUrl}/service-categories/${id}`, categoryData)
      .pipe(catchError(this.handleError<ServiceCategory>('updateCategory')));
  }

  // Delete category
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/service-categories/${id}`)
      .pipe(catchError(this.handleError<any>('deleteCategory')));
  }

  // Toggle category active status
  toggleCategoryStatus(id: string, active: boolean): Observable<ServiceCategory> {
    return this.http.patch<ServiceCategory>(`${this.apiUrl}/service-categories/${id}/status`, { active })
      .pipe(catchError(this.handleError<ServiceCategory>('toggleCategoryStatus')));
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

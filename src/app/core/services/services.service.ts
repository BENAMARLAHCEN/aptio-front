import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
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

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load services. Please try again.');
          return throwError(() => error);
        })
      );
  }
  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}`)
      .pipe(
        catchError(error => {
          this.notificationService.error(`Failed to load service details. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  createService(serviceData: ServiceFormData): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/services`, serviceData)
      .pipe(
        tap(() => {
          this.notificationService.success('Service created successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to create service. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  updateService(id: string, serviceData: ServiceFormData): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/services/${id}`, serviceData)
      .pipe(
        tap(() => {
          this.notificationService.success('Service updated successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update service. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${id}`)
      .pipe(
        tap(() => {
          this.notificationService.success('Service deleted successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to delete service. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  toggleServiceStatus(id: string, active: boolean): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/services/${id}/status`, { active })
      .pipe(
        tap(() => {
          const status = active ? 'activated' : 'deactivated';
          this.notificationService.success(`Service ${status} successfully!`);
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update service status. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  getServicesByCategory(category: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services?category=${category}`)
      .pipe(
        catchError(error => {
          this.notificationService.error(`Failed to load services in category ${category}. Please try again.`);
          return throwError(() => error);
        })
      );
  }
  searchServices(query: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services?search=${query}`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Search failed. Please try again.');
          return throwError(() => error);
        })
      );
  }
  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.apiUrl}/service-categories`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load service categories. Please try again.');
          return throwError(() => error);
        })
      );
  }
  getCategoryById(id: string): Observable<ServiceCategory> {
    return this.http.get<ServiceCategory>(`${this.apiUrl}/service-categories/${id}`)
      .pipe(
        catchError(error => {
          this.notificationService.error(`Failed to load category details. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  createCategory(categoryData: Partial<ServiceCategory>): Observable<ServiceCategory> {
    return this.http.post<ServiceCategory>(`${this.apiUrl}/service-categories`, categoryData)
      .pipe(
        tap(() => {
          this.notificationService.success('Service category created successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to create category. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  updateCategory(id: string, categoryData: Partial<ServiceCategory>): Observable<ServiceCategory> {
    return this.http.put<ServiceCategory>(`${this.apiUrl}/service-categories/${id}`, categoryData)
      .pipe(
        tap(() => {
          this.notificationService.success('Service category updated successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update category. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/service-categories/${id}`)
      .pipe(
        tap(() => {
          this.notificationService.success('Service category deleted successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to delete category. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
  toggleCategoryStatus(id: string, active: boolean): Observable<ServiceCategory> {
    return this.http.patch<ServiceCategory>(`${this.apiUrl}/service-categories/${id}/status`, { active })
      .pipe(
        tap(() => {
          const status = active ? 'activated' : 'deactivated';
          this.notificationService.success(`Service category ${status} successfully!`);
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update category status. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }
}

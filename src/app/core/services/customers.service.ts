// src/app/core/services/customers.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: Address;
  birthDate?: any;
  gender?: string;
  notes?: CustomerNote[];
  profileImage?: string;
  registrationDate: string;
  lastVisit?: string;
  totalVisits: number;
  totalSpent: number;
  active: boolean;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: Address;
  birthDate?: string;
  gender?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // Get all customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load customers. Please try again.');
          return throwError(() => error);
        })
      );
  }

  // Get customer by ID
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`)
      .pipe(
        catchError(error => {
          this.notificationService.error(`Failed to load customer details. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  // Create new customer
  createCustomer(customerData: CustomerFormData): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customerData)
      .pipe(
        tap(result => {
          this.notificationService.success('Customer created successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to create customer. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  // Update existing customer
  updateCustomer(id: string, customerData: Partial<CustomerFormData>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, customerData)
      .pipe(
        tap(result => {
          this.notificationService.success('Customer updated successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update customer. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  // Delete customer
  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${id}`)
      .pipe(
        tap(result => {
          this.notificationService.success('Customer deleted successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to delete customer. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  // Toggle customer active status
  toggleCustomerStatus(id: string, active: boolean): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/status`, { active })
      .pipe(
        tap(result => {
          const status = active ? 'activated' : 'deactivated';
          this.notificationService.success(`Customer ${status} successfully!`);
        }),
        catchError(error => {
          this.notificationService.error(`Failed to update customer status. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  // Search customers
  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers/search?query=${query}`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to search customers. Please try again.');
          return throwError(() => error);
        })
      );
  }

  // Add a note to customer
  addCustomerNote(customerId: string, content: string): Observable<CustomerNote> {
    return this.http.post<CustomerNote>(`${this.apiUrl}/customers/${customerId}/notes`, { content })
      .pipe(
        tap(result => {
          this.notificationService.success('Note added successfully!');
        }),
        catchError(error => {
          this.notificationService.error(`Failed to add note. ${error.error?.message || 'Please try again.'}`);
          return throwError(() => error);
        })
      );
  }

  // Get customer notes
  getCustomerNotes(customerId: string): Observable<CustomerNote[]> {
    return this.http.get<CustomerNote[]>(`${this.apiUrl}/customers/${customerId}/notes`)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load customer notes. Please try again.');
          return throwError(() => error);
        })
      );
  }
}

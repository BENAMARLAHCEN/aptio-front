// src/app/core/services/customers.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  birthDate?: string;
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

  constructor(private http: HttpClient) {}

  // Get all customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
      .pipe(catchError(this.handleError<Customer[]>('getCustomers', [])));
  }

  // Get customer by ID
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`)
      .pipe(catchError(this.handleError<Customer>('getCustomerById')));
  }

  // Create new customer
  createCustomer(customerData: CustomerFormData): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customerData)
      .pipe(catchError(this.handleError<Customer>('createCustomer')));
  }

  // Update existing customer
  updateCustomer(id: string, customerData: Partial<CustomerFormData>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, customerData)
      .pipe(catchError(this.handleError<Customer>('updateCustomer')));
  }

  // Delete customer
  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${id}`)
      .pipe(catchError(this.handleError<any>('deleteCustomer')));
  }

  // Toggle customer active status
  toggleCustomerStatus(id: string, active: boolean): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/status`, { active })
      .pipe(catchError(this.handleError<Customer>('toggleCustomerStatus')));
  }

  // Search customers
  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers/search?query=${query}`)
      .pipe(catchError(this.handleError<Customer[]>('searchCustomers', [])));
  }

  // Add a note to customer
  addCustomerNote(customerId: string, content: string): Observable<CustomerNote> {
    return this.http.post<CustomerNote>(`${this.apiUrl}/customers/${customerId}/notes`, { content })
      .pipe(catchError(this.handleError<CustomerNote>('addCustomerNote')));
  }

  // Get customer notes
  getCustomerNotes(customerId: string): Observable<CustomerNote[]> {
    return this.http.get<CustomerNote[]>(`${this.apiUrl}/customers/${customerId}/notes`)
      .pipe(catchError(this.handleError<CustomerNote[]>('getCustomerNotes', [])));
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

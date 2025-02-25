// src/app/core/services/customers.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:8080/api/v1/customers';

  // Mock data for demonstration
  private mockCustomers: Customer[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      birthDate: '1985-06-15',
      gender: 'Male',
      notes: [
        {
          id: '101',
          content: 'Prefers appointments in the morning',
          createdAt: '2024-12-15T10:30:00Z',
          createdBy: 'Staff'
        }
      ],
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      registrationDate: '2024-11-05T09:20:00Z',
      lastVisit: '2025-02-10T14:30:00Z',
      totalVisits: 5,
      totalSpent: 350,
      active: true
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-234-5678',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      birthDate: '1990-03-22',
      gender: 'Female',
      notes: [
        {
          id: '201',
          content: 'Allergic to certain products',
          createdAt: '2024-12-20T14:15:00Z',
          createdBy: 'Staff'
        }
      ],
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      registrationDate: '2024-10-12T11:45:00Z',
      lastVisit: '2025-02-15T15:00:00Z',
      totalVisits: 8,
      totalSpent: 620,
      active: true
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      phone: '555-345-6789',
      address: {
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      birthDate: '1982-11-08',
      gender: 'Male',
      registrationDate: '2024-10-18T13:20:00Z',
      lastVisit: '2025-01-28T10:15:00Z',
      totalVisits: 3,
      totalSpent: 210,
      active: true
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      phone: '555-456-7890',
      address: {
        street: '321 Maple Dr',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        country: 'USA'
      },
      birthDate: '1988-07-19',
      gender: 'Female',
      notes: [
        {
          id: '401',
          content: 'Referred by Jane Smith',
          createdAt: '2024-11-05T09:45:00Z',
          createdBy: 'Staff'
        },
        {
          id: '402',
          content: 'Interested in monthly packages',
          createdAt: '2025-01-10T16:30:00Z',
          createdBy: 'Staff'
        }
      ],
      profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      registrationDate: '2024-11-05T09:30:00Z',
      lastVisit: '2025-02-05T13:45:00Z',
      totalVisits: 4,
      totalSpent: 290,
      active: true
    },
    {
      id: '5',
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@example.com',
      phone: '555-567-8901',
      birthDate: '1975-09-30',
      gender: 'Male',
      registrationDate: '2024-09-22T10:15:00Z',
      totalVisits: 1,
      totalSpent: 75,
      active: false
    },
    {
      id: '6',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '555-678-9012',
      address: {
        street: '852 Cedar Ln',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      },
      birthDate: '1992-04-12',
      gender: 'Female',
      notes: [
        {
          id: '601',
          content: 'Prefers evening appointments',
          createdAt: '2024-12-01T17:00:00Z',
          createdBy: 'Staff'
        }
      ],
      profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
      registrationDate: '2024-10-01T14:30:00Z',
      lastVisit: '2025-02-18T18:00:00Z',
      totalVisits: 6,
      totalSpent: 480,
      active: true
    },
    {
      id: '7',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@example.com',
      phone: '555-789-0123',
      address: {
        street: '963 Elm St',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        country: 'USA'
      },
      birthDate: '1980-12-05',
      gender: 'Male',
      registrationDate: '2024-11-15T08:45:00Z',
      lastVisit: '2025-01-22T11:30:00Z',
      totalVisits: 2,
      totalSpent: 150,
      active: true
    }
  ];

  constructor(private http: HttpClient) {}

  // Get all customers
  getCustomers(): Observable<Customer[]> {
    // In production: return this.http.get<Customer[]>(this.apiUrl);
    return of(this.mockCustomers).pipe(delay(500));
  }

  // Get customer by ID
  getCustomerById(id: string): Observable<Customer> {
    // In production: return this.http.get<Customer>(`${this.apiUrl}/${id}`);
    const customer = this.mockCustomers.find(c => c.id === id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return of(customer).pipe(delay(300));
  }

  // Create new customer
  createCustomer(customerData: CustomerFormData): Observable<Customer> {
    // In production: return this.http.post<Customer>(this.apiUrl, customerData);

    // Create new customer with mock ID
    const newCustomer: Customer = {
      id: (this.mockCustomers.length + 1).toString(),
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      birthDate: customerData.birthDate,
      gender: customerData.gender,
      notes: customerData.notes ? [
        {
          id: `${Date.now()}`,
          content: customerData.notes,
          createdAt: new Date().toISOString(),
          createdBy: 'Staff'
        }
      ] : undefined,
      registrationDate: new Date().toISOString(),
      totalVisits: 0,
      totalSpent: 0,
      active: true
    };

    // Add to mock data
    this.mockCustomers.push(newCustomer);

    return of(newCustomer).pipe(delay(500));
  }

  // Update existing customer
  updateCustomer(id: string, customerData: Partial<CustomerFormData>): Observable<Customer> {
    // In production: return this.http.put<Customer>(`${this.apiUrl}/${id}`, customerData);

    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    // Create a deep copy of the customer
    const customer = JSON.parse(JSON.stringify(this.mockCustomers[index])) as Customer;

    // Update the customer data with the form data
    const updatedCustomer: Customer = {
      ...customer,
      firstName: customerData.firstName ?? customer.firstName,
      lastName: customerData.lastName ?? customer.lastName,
      email: customerData.email ?? customer.email,
      phone: customerData.phone ?? customer.phone,
      birthDate: customerData.birthDate ?? customer.birthDate,
      gender: customerData.gender ?? customer.gender,
      address: customerData.address ?? customer.address
    };

    // Handle notes separately if provided
    if (customerData.notes) {
      const newNote: CustomerNote = {
        id: `${Date.now()}`,
        content: customerData.notes,
        createdAt: new Date().toISOString(),
        createdBy: 'Staff'
      };

      updatedCustomer.notes = updatedCustomer.notes
        ? [...updatedCustomer.notes, newNote]
        : [newNote];
    }

    this.mockCustomers[index] = updatedCustomer;

    return of(updatedCustomer).pipe(delay(500));
  }

  // Delete customer
  deleteCustomer(id: string): Observable<void> {
    // In production: return this.http.delete<void>(`${this.apiUrl}/${id}`);

    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    // Remove from mock data
    this.mockCustomers.splice(index, 1);

    return of(undefined).pipe(delay(500));
  }

  // Toggle customer active status
  toggleCustomerStatus(id: string, active: boolean): Observable<Customer> {
    // In production: return this.http.patch<Customer>(`${this.apiUrl}/${id}/status`, { active });

    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    // Update status in mock data
    this.mockCustomers[index].active = active;

    return of(this.mockCustomers[index]).pipe(delay(300));
  }

  // Add a note to customer
  addCustomerNote(id: string, content: string): Observable<CustomerNote> {
    // In production: return this.http.post<CustomerNote>(`${this.apiUrl}/${id}/notes`, { content });

    const customer = this.mockCustomers.find(c => c.id === id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const newNote: CustomerNote = {
      id: `${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      createdBy: 'Staff'
    };

    // Add note to customer
    if (!customer.notes) {
      customer.notes = [];
    }
    customer.notes.push(newNote);

    return of(newNote).pipe(delay(300));
  }

  // Search customers
  searchCustomers(query: string): Observable<Customer[]> {
    // In production: return this.http.get<Customer[]>(`${this.apiUrl}/search?q=${query}`);

    if (!query) {
      return of(this.mockCustomers).pipe(delay(300));
    }

    const lowercaseQuery = query.toLowerCase();
    const filteredCustomers = this.mockCustomers.filter(customer =>
      customer.firstName.toLowerCase().includes(lowercaseQuery) ||
      customer.lastName.toLowerCase().includes(lowercaseQuery) ||
      customer.email.toLowerCase().includes(lowercaseQuery) ||
      customer.phone.includes(query)
    );

    return of(filteredCustomers).pipe(delay(300));
  }

  // Get customer appointments (would be implemented in a real API)
  getCustomerAppointments(id: string): Observable<any[]> {
    // Mock implementation
    return of([]).pipe(delay(300));
  }
}

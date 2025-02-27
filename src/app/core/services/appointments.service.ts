// src/app/core/services/appointments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
}
export interface GuestBookingRequest {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  customerId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
    }
  };
}

export interface AppointmentStatus {
  value: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  label: string;
  color: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO format
  time: string; // 24-hour format
  duration: number; // in minutes
  status: AppointmentStatus['value'];
  notes?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFormData {
  customerId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private apiUrl = 'http://localhost:8080/api/v1/appointments';

  // Status options for appointments
  readonly statusOptions: AppointmentStatus[] = [
    { value: 'pending', label: 'Pending', color: '#FFC107' },
    { value: 'confirmed', label: 'Confirmed', color: '#4CAF50' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
    { value: 'completed', label: 'Completed', color: '#2196F3' }
  ];

  // Mock data for demonstration
  private mockAppointments: Appointment[] = [
    {
      id: '1',
      customerId: '101',
      customerName: 'John Doe',
      serviceId: '201',
      serviceName: 'Haircut',
      date: '2025-02-25',
      time: '14:30',
      duration: 30,
      status: 'confirmed',
      price: 35,
      notes: 'Regular customer, prefers quick service',
      createdAt: '2025-02-20T10:00:00Z',
      updatedAt: '2025-02-20T10:00:00Z'
    },
    {
      id: '2',
      customerId: '102',
      customerName: 'Jane Smith',
      serviceId: '202',
      serviceName: 'Manicure',
      date: '2025-02-25',
      time: '16:00',
      duration: 45,
      status: 'pending',
      price: 25,
      createdAt: '2025-02-21T09:15:00Z',
      updatedAt: '2025-02-21T09:15:00Z'
    },
    {
      id: '3',
      customerId: '103',
      customerName: 'Mike Johnson',
      serviceId: '203',
      serviceName: 'Massage',
      date: '2025-02-26',
      time: '10:15',
      duration: 60,
      status: 'confirmed',
      price: 70,
      notes: 'Back pain issues, gentle pressure',
      createdAt: '2025-02-22T14:30:00Z',
      updatedAt: '2025-02-22T14:30:00Z'
    },
    {
      id: '4',
      customerId: '104',
      customerName: 'Sarah Williams',
      serviceId: '204',
      serviceName: 'Facial',
      date: '2025-02-26',
      time: '11:30',
      duration: 45,
      status: 'confirmed',
      price: 55,
      createdAt: '2025-02-22T16:45:00Z',
      updatedAt: '2025-02-22T16:45:00Z'
    },
    {
      id: '5',
      customerId: '105',
      customerName: 'Robert Brown',
      serviceId: '205',
      serviceName: 'Consultation',
      date: '2025-02-27',
      time: '15:45',
      duration: 30,
      status: 'cancelled',
      price: 0,
      notes: 'Cancelled due to emergency',
      createdAt: '2025-02-23T08:20:00Z',
      updatedAt: '2025-02-24T13:10:00Z'
    },
    {
      id: '6',
      customerId: '106',
      customerName: 'Emily Davis',
      serviceId: '206',
      serviceName: 'Hair Coloring',
      date: '2025-02-28',
      time: '09:00',
      duration: 120,
      status: 'confirmed',
      price: 120,
      notes: 'Wants blonde highlights',
      createdAt: '2025-02-24T10:30:00Z',
      updatedAt: '2025-02-24T10:30:00Z'
    },
    {
      id: '7',
      customerId: '107',
      customerName: 'David Miller',
      serviceId: '207',
      serviceName: 'Beard Trim',
      date: '2025-02-28',
      time: '12:30',
      duration: 20,
      status: 'pending',
      price: 15,
      createdAt: '2025-02-24T15:15:00Z',
      updatedAt: '2025-02-24T15:15:00Z'
    }
  ];

  // Mock services for demonstration
  private mockServices: Service[] = [
    { id: '201', name: 'Haircut', description: 'Basic haircut service', duration: 30, price: 35, category: 'Hair' },
    { id: '202', name: 'Manicure', description: 'Basic manicure service', duration: 45, price: 25, category: 'Nails' },
    { id: '203', name: 'Massage', description: 'Full body massage', duration: 60, price: 70, category: 'Spa' },
    { id: '204', name: 'Facial', description: 'Refreshing facial treatment', duration: 45, price: 55, category: 'Spa' },
    { id: '205', name: 'Consultation', description: 'Style consultation service', duration: 30, price: 0, category: 'Other' },
    { id: '206', name: 'Hair Coloring', description: 'Hair color or highlights', duration: 120, price: 120, category: 'Hair' },
    { id: '207', name: 'Beard Trim', description: 'Beard shaping and trimming', duration: 20, price: 15, category: 'Hair' }
  ];

  // Mock customers for demonstration
  private mockCustomers: Customer[] = [
    { id: '101', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '555-123-4567' },
    { id: '102', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '555-234-5678' },
    { id: '103', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com', phone: '555-345-6789' },
    { id: '104', firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com', phone: '555-456-7890' },
    { id: '105', firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@example.com', phone: '555-567-8901' },
    { id: '106', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@example.com', phone: '555-678-9012' },
    { id: '107', firstName: 'David', lastName: 'Miller', email: 'david.miller@example.com', phone: '555-789-0123' }
  ];

  constructor(private http: HttpClient) {}

  // Get all appointments
  getAppointments(): Observable<Appointment[]> {
    // In production: return this.http.get<Appointment[]>(this.apiUrl);
    return of(this.mockAppointments).pipe(delay(500));
  }

  // Get appointment by ID
  getAppointmentById(id: string): Observable<Appointment> {
    // In production: return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
    const appointment = this.mockAppointments.find(a => a.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return of(appointment).pipe(delay(300));
  }

  // Create new appointment
  createAppointment(appointmentData: AppointmentFormData): Observable<Appointment> {
    // In production: return this.http.post<Appointment>(this.apiUrl, appointmentData);

    // Find service and customer details from mock data
    const service = this.mockServices.find(s => s.id === appointmentData.serviceId);
    const customer = this.mockCustomers.find(c => c.id === appointmentData.customerId);

    if (!service || !customer) {
      throw new Error('Service or customer not found');
    }

    // Create new appointment with mock ID and dates
    const newAppointment: Appointment = {
      id: (this.mockAppointments.length + 1).toString(),
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      serviceId: service.id,
      serviceName: service.name,
      date: appointmentData.date,
      time: appointmentData.time,
      duration: service.duration,
      status: 'pending',
      price: service.price,
      notes: appointmentData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data
    this.mockAppointments.push(newAppointment);

    return of(newAppointment).pipe(delay(500));
  }

  // Update existing appointment
  updateAppointment(id: string, appointmentData: Partial<Appointment>): Observable<Appointment> {
    // In production: return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointmentData);

    const index = this.mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }

    // Update appointment in mock data
    const updatedAppointment = {
      ...this.mockAppointments[index],
      ...appointmentData,
      updatedAt: new Date().toISOString()
    };

    this.mockAppointments[index] = updatedAppointment;

    return of(updatedAppointment).pipe(delay(500));
  }

  // Delete appointment
  deleteAppointment(id: string): Observable<void> {
    // In production: return this.http.delete<void>(`${this.apiUrl}/${id}`);

    const index = this.mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }

    // Remove from mock data
    this.mockAppointments.splice(index, 1);

    return of(undefined).pipe(delay(500));
  }

  // Change appointment status
  updateAppointmentStatus(id: string, status: AppointmentStatus['value']): Observable<Appointment> {
    return this.updateAppointment(id, { status });
  }

  // Get all services
  getServices(): Observable<Service[]> {
    // In production: return this.http.get<Service[]>('http://localhost:8080/api/v1/services');
    return of(this.mockServices).pipe(delay(300));
  }

  // Get all customers
  getCustomers(): Observable<Customer[]> {
    // In production: return this.http.get<Customer[]>('http://localhost:8080/api/v1/customers');
    return of(this.mockCustomers).pipe(delay(300));
  }

  // Get appointment status by value
  getStatusDetails(statusValue: AppointmentStatus['value']): AppointmentStatus {
    const status = this.statusOptions.find(s => s.value === statusValue);
    return status || this.statusOptions[0];
  }

  // Get available time slots for a specific date
  getAvailableTimeSlots(date: string, serviceId: string): Observable<string[]> {
    // In production, this would query the backend for available slots based on staff availability,
    // business hours, and existing appointments

    // Mock time slots from 9 AM to 5 PM every 30 minutes
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    // Filter out times that are already booked
    const bookedSlots = this.mockAppointments
      .filter(a => a.date === date && a.status !== 'cancelled')
      .map(a => a.time);

    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));

    return of(availableSlots).pipe(delay(300));
  }


  createGuestAppointment(appointmentData: GuestBookingRequest): Observable<Appointment> {
    // In production: return this.http.post<Appointment>(`${this.apiUrl}/guest-booking`, appointmentData);

    // For demonstration, we'll simulate creating a guest booking
    // Find service details from mock data
    const service = this.mockServices.find(s => s.id === appointmentData.serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    // Create a mock customer for the guest
    const guestCustomer: Customer = {
      id: `guest-${Date.now()}`,
      firstName: appointmentData.customerInfo.firstName,
      lastName: appointmentData.customerInfo.lastName,
      email: appointmentData.customerInfo.email,
      phone: appointmentData.customerInfo.phone
    };

    // Create new appointment with mock ID and dates
    const newAppointment: Appointment = {
      id: (this.mockAppointments.length + 1).toString(),
      customerId: guestCustomer.id,
      customerName: `${guestCustomer.firstName} ${guestCustomer.lastName}`,
      serviceId: service.id,
      serviceName: service.name,
      date: appointmentData.date,
      time: appointmentData.time,
      duration: service.duration,
      status: 'pending',
      price: service.price,
      notes: appointmentData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data
    this.mockAppointments.push(newAppointment);
    this.mockCustomers.push(guestCustomer);

    return of(newAppointment).pipe(delay(500));
  }
}

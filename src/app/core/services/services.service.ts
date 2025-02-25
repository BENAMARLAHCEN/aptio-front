// src/app/core/services/services.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:8080/api/v1/services';

  // Mock data for demonstration
  private mockServices: Service[] = [
    {
      id: '1',
      name: 'Haircut',
      description: 'Basic haircut service with styling',
      duration: 30,
      price: 35,
      category: 'Hair',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1596178060810-72660affe577?q=80&w=300'
    },
    {
      id: '2',
      name: 'Hair Coloring',
      description: 'Full hair coloring service with premium products',
      duration: 120,
      price: 120,
      category: 'Hair',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1560966571-385ea47ff258?q=80&w=300'
    },
    {
      id: '3',
      name: 'Beard Trim',
      description: 'Professional beard trimming and shaping',
      duration: 20,
      price: 15,
      category: 'Hair',
      active: true
    },
    {
      id: '4',
      name: 'Manicure',
      description: 'Basic manicure service with polish',
      duration: 45,
      price: 25,
      category: 'Nails',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300'
    },
    {
      id: '5',
      name: 'Pedicure',
      description: 'Relaxing pedicure service with exfoliation',
      duration: 60,
      price: 35,
      category: 'Nails',
      active: true
    },
    {
      id: '6',
      name: 'Gel Nails',
      description: 'Long-lasting gel nail application',
      duration: 75,
      price: 45,
      category: 'Nails',
      active: true
    },
    {
      id: '7',
      name: 'Facial',
      description: 'Refreshing facial treatment for all skin types',
      duration: 45,
      price: 55,
      category: 'Spa',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=300'
    },
    {
      id: '8',
      name: 'Massage',
      description: 'Full body relaxation massage',
      duration: 60,
      price: 70,
      category: 'Spa',
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=300'
    },
    {
      id: '9',
      name: 'Style Consultation',
      description: 'Personal style consultation with our experts',
      duration: 30,
      price: 40,
      category: 'Consultation',
      active: false
    }
  ];

  private mockCategories: ServiceCategory[] = [
    { id: '1', name: 'Hair', description: 'Hair cutting, styling, and coloring services', active: true, servicesCount: 3 },
    { id: '2', name: 'Nails', description: 'Manicure, pedicure, and nail art services', active: true, servicesCount: 3 },
    { id: '3', name: 'Spa', description: 'Relaxation and wellness treatments', active: true, servicesCount: 2 },
    { id: '4', name: 'Consultation', description: 'Style and beauty consultations', active: true, servicesCount: 1 },
    { id: '5', name: 'Makeup', description: 'Professional makeup services', active: true, servicesCount: 0 }
  ];

  constructor(private http: HttpClient) {}

  // Get all services
  getServices(): Observable<Service[]> {
    // In production: return this.http.get<Service[]>(this.apiUrl);
    return of(this.mockServices).pipe(delay(500));
  }

  // Get service by ID
  getServiceById(id: string): Observable<Service> {
    // In production: return this.http.get<Service>(`${this.apiUrl}/${id}`);
    const service = this.mockServices.find(s => s.id === id);
    if (!service) {
      throw new Error('Service not found');
    }
    return of(service).pipe(delay(300));
  }

  // Create new service
  createService(serviceData: ServiceFormData): Observable<Service> {
    // In production: return this.http.post<Service>(this.apiUrl, serviceData);

    // Create new service with mock ID
    const newService: Service = {
      id: (this.mockServices.length + 1).toString(),
      ...serviceData
    };

    // Add to mock data
    this.mockServices.push(newService);

    // Update category count
    const category = this.mockCategories.find(c => c.name === newService.category);
    if (category) {
      category.servicesCount++;
    }

    return of(newService).pipe(delay(500));
  }

  // Update existing service
  updateService(id: string, serviceData: ServiceFormData): Observable<Service> {
    // In production: return this.http.put<Service>(`${this.apiUrl}/${id}`, serviceData);

    const index = this.mockServices.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Service not found');
    }

    // Check if category changed
    const oldCategory = this.mockServices[index].category;
    const newCategory = serviceData.category;

    if (oldCategory !== newCategory) {
      // Update category counts
      const oldCat = this.mockCategories.find(c => c.name === oldCategory);
      const newCat = this.mockCategories.find(c => c.name === newCategory);

      if (oldCat) {
        oldCat.servicesCount--;
      }

      if (newCat) {
        newCat.servicesCount++;
      }
    }

    // Update service in mock data
    const updatedService: Service = {
      ...this.mockServices[index],
      ...serviceData
    };

    this.mockServices[index] = updatedService;

    return of(updatedService).pipe(delay(500));
  }

  // Delete service
  deleteService(id: string): Observable<void> {
    // In production: return this.http.delete<void>(`${this.apiUrl}/${id}`);

    const index = this.mockServices.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Service not found');
    }

    // Update category count
    const category = this.mockCategories.find(c => c.name === this.mockServices[index].category);
    if (category) {
      category.servicesCount--;
    }

    // Remove from mock data
    this.mockServices.splice(index, 1);

    return of(undefined).pipe(delay(500));
  }

  // Toggle service active status
  toggleServiceStatus(id: string): Observable<Service> {
    const service = this.mockServices.find(s => s.id === id);
    if (!service) {
      throw new Error('Service not found');
    }

    service.active = !service.active;

    return of(service).pipe(delay(300));
  }

  // Get all categories
  getCategories(): Observable<ServiceCategory[]> {
    // In production: return this.http.get<ServiceCategory[]>('http://localhost:8080/api/v1/service-categories');
    return of(this.mockCategories).pipe(delay(500));
  }

  // Create new category
  createCategory(category: Omit<ServiceCategory, 'id' | 'servicesCount'>): Observable<ServiceCategory> {
    // In production: return this.http.post<ServiceCategory>('http://localhost:8080/api/v1/service-categories', category);

    const newCategory: ServiceCategory = {
      id: (this.mockCategories.length + 1).toString(),
      ...category,
      servicesCount: 0
    };

    this.mockCategories.push(newCategory);

    return of(newCategory).pipe(delay(500));
  }

  // Update category
  updateCategory(id: string, categoryData: Partial<ServiceCategory>): Observable<ServiceCategory> {
    // In production: return this.http.put<ServiceCategory>(`http://localhost:8080/api/v1/service-categories/${id}`, categoryData);

    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    const updatedCategory = {
      ...this.mockCategories[index],
      ...categoryData
    };

    this.mockCategories[index] = updatedCategory;

    return of(updatedCategory).pipe(delay(500));
  }

  // Delete category
  deleteCategory(id: string): Observable<void> {
    // In production: return this.http.delete<void>(`http://localhost:8080/api/v1/service-categories/${id}`);

    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }

    // Check if category has services
    if (this.mockCategories[index].servicesCount > 0) {
      throw new Error('Cannot delete category with services');
    }

    this.mockCategories.splice(index, 1);

    return of(undefined).pipe(delay(500));
  }

  // Get services by category
  getServicesByCategory(category: string): Observable<Service[]> {
    // In production: return this.http.get<Service[]>(`${this.apiUrl}/category/${category}`);

    const filteredServices = this.mockServices.filter(s => s.category === category);

    return of(filteredServices).pipe(delay(300));
  }
}

// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  phone: string;
  birthday: Date;
  profilePhoto?: string;
  isCollector: boolean;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/v1/users';

  // Mock user data for demo (remove in production)
  private mockUser: User = {
    id: '1',
    email: 'john.doe@example.com',
    password: '',
    firstName: 'John',
    lastName: 'Doe',
    address: {
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001'
    },
    phone: '555-123-4567',
    birthday: new Date(1990, 1, 15),
    profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
    isCollector: false,
    points: 450
  };

  constructor(private http: HttpClient) {}

  // Get current user profile
  getCurrentUser(): Observable<User> {
    // For demo purposes, return mock data
    // In production: return this.http.get<User>(`${this.apiUrl}/me`);
    return of(this.mockUser);
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    // For demo purposes, update mock data and return
    // In production: return this.http.patch<User>(`${this.apiUrl}/me`, userData);
    this.mockUser = { ...this.mockUser, ...userData };
    return of(this.mockUser);
  }

  // Update profile photo
  updateProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // For demo, just return success
    // In production: return this.http.post(`${this.apiUrl}/me/photo`, formData);
    return of({ success: true, url: URL.createObjectURL(file) });
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // For demo, just return success
    // In production: return this.http.post(`${this.apiUrl}/me/change-password`, { currentPassword, newPassword });
    return of({ success: true });
  }
}

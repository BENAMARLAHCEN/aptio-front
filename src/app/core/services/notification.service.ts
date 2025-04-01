
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {HttpErrorResponse} from "@angular/common/http";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public readonly notifications$ = this.notifications.asObservable();

  constructor() {}

  handleError(error: any, defaultMessage: string = 'An error occurred. Please try again.'): void {
    console.error('API Error:', error);

    let errorMessage = defaultMessage;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.statusText) {
        errorMessage = `${error.status} - ${error.statusText}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.error(errorMessage);
  }

  success(message: string, duration: number = 5000): void {
    this.addNotification('success', message, duration);
  }

  error(message: string, duration: number = 8000): void {
    this.addNotification('error', message, duration);
  }

  warning(message: string, duration: number = 6000): void {
    this.addNotification('warning', message, duration);
  }

  info(message: string, duration: number = 5000): void {
    this.addNotification('info', message, duration);
  }

  created(itemType: string): void {
    this.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created successfully!`);
  }

  updated(itemType: string): void {
    this.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated successfully!`);
  }

  deleted(itemType: string): void {
    this.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
  }
  loadFailed(itemType: string): void {
    this.error(`Failed to load ${itemType}. Please try again.`);
  }

  saveFailed(itemType: string): void {
    this.error(`Failed to save ${itemType}. Please try again.`);
  }

  deleteFailed(itemType: string): void {
    this.error(`Failed to delete ${itemType}. Please try again.`);
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications.getValue();
    this.notifications.next(currentNotifications.filter(notification => notification.id !== id));
  }

  clearAll(): void {
    this.notifications.next([]);
  }

  private addNotification(type: NotificationType, message: string, duration: number): void {
    const id = this.generateId();
    const notification: Notification = { id, type, message, duration };

    const currentNotifications = this.notifications.getValue();
    this.notifications.next([...currentNotifications, notification]);
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }
  }


  private generateId(): string {
    return `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

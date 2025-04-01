// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {HttpErrorResponse} from "@angular/common/http";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // Duration in milliseconds
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

  /**
   * Show a success notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 5000)
   */
  success(message: string, duration: number = 5000): void {
    this.addNotification('success', message, duration);
  }

  /**
   * Show an error notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 8000)
   */
  error(message: string, duration: number = 8000): void {
    this.addNotification('error', message, duration);
  }

  /**
   * Show a warning notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 6000)
   */
  warning(message: string, duration: number = 6000): void {
    this.addNotification('warning', message, duration);
  }

  /**
   * Show an info notification
   * @param message The message to display
   * @param duration Optional duration in milliseconds (default: 5000)
   */
  info(message: string, duration: number = 5000): void {
    this.addNotification('info', message, duration);
  }

  /**
   * Notify about item creation
   * @param itemType Type of item created (e.g., 'appointment', 'customer')
   */
  created(itemType: string): void {
    this.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created successfully!`);
  }

  /**
   * Notify about item update
   * @param itemType Type of item updated (e.g., 'appointment', 'customer')
   */
  updated(itemType: string): void {
    this.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated successfully!`);
  }

  /**
   * Notify about item deletion
   * @param itemType Type of item deleted (e.g., 'appointment', 'customer')
   */
  deleted(itemType: string): void {
    this.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
  }

  /**
   * Notify about loading failure
   * @param itemType Type of item that failed to load (e.g., 'appointments', 'customers')
   */
  loadFailed(itemType: string): void {
    this.error(`Failed to load ${itemType}. Please try again.`);
  }

  /**
   * Notify about saving failure
   * @param itemType Type of item that failed to save (e.g., 'appointment', 'customer')
   */
  saveFailed(itemType: string): void {
    this.error(`Failed to save ${itemType}. Please try again.`);
  }

  /**
   * Notify about deletion failure
   * @param itemType Type of item that failed to delete (e.g., 'appointment', 'customer')
   */
  deleteFailed(itemType: string): void {
    this.error(`Failed to delete ${itemType}. Please try again.`);
  }

  /**
   * Remove a notification by ID
   * @param id The ID of the notification to remove
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.getValue();
    this.notifications.next(currentNotifications.filter(notification => notification.id !== id));
  }

  /**
   * Remove all notifications
   */
  clearAll(): void {
    this.notifications.next([]);
  }

  /**
   * Add a notification to the queue
   * @param type The type of notification
   * @param message The message to display
   * @param duration Duration in milliseconds
   */
  private addNotification(type: NotificationType, message: string, duration: number): void {
    const id = this.generateId();
    const notification: Notification = { id, type, message, duration };

    const currentNotifications = this.notifications.getValue();
    this.notifications.next([...currentNotifications, notification]);

    // Automatically remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }
  }

  /**
   * Generate a unique ID for notifications
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

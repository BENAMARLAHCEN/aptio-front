// src/app/core/services/confirm-dialog.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmDialogData {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'warning' | 'info';
}

export interface ConfirmDialogState extends ConfirmDialogData {
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  // Default state with dialog closed
  private initialState: ConfirmDialogState = {
    id: '',
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary'
  };

  // Dialog state as an observable
  private dialogState = new BehaviorSubject<ConfirmDialogState>(this.initialState);
  public dialogState$ = this.dialogState.asObservable();

  // Promise resolver for the confirm result
  private dialogResolver?: (value: boolean) => void;

  constructor() {}

  /**
   * Open a confirm dialog and return a promise that resolves with the user's choice
   * @param data Configuration for the dialog
   * @returns Promise that resolves to true (confirm) or false (cancel)
   */
  confirm(data: ConfirmDialogData): Promise<boolean> {
    // Create new promise
    const promise = new Promise<boolean>(resolve => {
      this.dialogResolver = resolve;
    });

    // Update dialog state to open with provided data
    this.dialogState.next({
      ...data,
      confirmText: data.confirmText || 'Confirm',
      cancelText: data.cancelText || 'Cancel',
      type: data.type || 'primary',
      isOpen: true
    });

    return promise;
  }

  /**
   * Close the dialog with a result
   * @param confirmed Whether the user confirmed or cancelled
   */
  close(confirmed: boolean): void {
    // Reset the dialog state
    this.dialogState.next({
      ...this.initialState,
      isOpen: false
    });

    // Resolve the promise if it exists
    if (this.dialogResolver) {
      this.dialogResolver(confirmed);
      this.dialogResolver = undefined;
    }
  }

  /**
   * Show a confirm delete dialog
   * @param itemName The name of the item to delete
   * @returns Promise that resolves to true (confirm) or false (cancel)
   */
  confirmDelete(itemName: string): Promise<boolean> {
    return this.confirm({
      id: 'delete-confirm',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  /**
   * Show a confirm reset dialog
   * @param itemName The name of the item to reset
   * @returns Promise that resolves to true (confirm) or false (cancel)
   */
  confirmReset(itemName: string = 'changes'): Promise<boolean> {
    return this.confirm({
      id: 'reset-confirm',
      title: 'Confirm Reset',
      message: `Are you sure you want to reset all ${itemName}? Any unsaved changes will be lost.`,
      confirmText: 'Reset',
      cancelText: 'Cancel',
      type: 'warning'
    });
  }

  /**
   * Show a confirm discard dialog
   * @param itemName The name of the item to discard
   * @returns Promise that resolves to true (confirm) or false (cancel)
   */
  confirmDiscard(itemName: string = 'changes'): Promise<boolean> {
    return this.confirm({
      id: 'discard-confirm',
      title: 'Unsaved Changes',
      message: `You have unsaved ${itemName}. Are you sure you want to leave this page?`,
      confirmText: 'Discard Changes',
      cancelText: 'Stay on Page',
      type: 'warning'
    });
  }

  /**
   * Show a custom confirm dialog with the primary style
   */
  confirmAction(title: string, message: string, confirmText: string = 'Confirm'): Promise<boolean> {
    return this.confirm({
      id: 'action-confirm',
      title,
      message,
      confirmText,
      type: 'primary'
    });
  }

  /**
   * Show a confirm status change dialog
   * @param status The new status value
   * @param statusLabel The human-readable status label
   * @param itemType The type of item being changed (default: 'item')
   * @returns Promise that resolves to true (confirm) or false (cancel)
   */
  confirmStatusChange(status: string, statusLabel: string, itemType: string = 'item'): Promise<boolean> {
    const isCriticalStatus = ['cancelled', 'deleted', 'rejected', 'terminated'].includes(status.toLowerCase());

    return this.confirm({
      id: 'status-change-confirm',
      title: `Update Status to ${statusLabel}`,
      message: `Are you sure you want to update this ${itemType}'s status to ${statusLabel.toLowerCase()}?`,
      confirmText: 'Yes, Update',
      cancelText: 'No, Cancel',
      type: isCriticalStatus ? 'warning' : 'primary'
    });
  }
}

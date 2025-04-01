
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
  private initialState: ConfirmDialogState = {
    id: '',
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary'
  };
  private dialogState = new BehaviorSubject<ConfirmDialogState>(this.initialState);
  public dialogState$ = this.dialogState.asObservable();
  private dialogResolver?: (value: boolean) => void;

  constructor() {}

  /**
   * Open a confirm dialog and return a promise that resolves with the user's choice
   * @param data Configuration for the dialog
   * @returns Promise that resolves to true (confirm) or false (cancel)
   */
  confirm(data: ConfirmDialogData): Promise<boolean> {
    const promise = new Promise<boolean>(resolve => {
      this.dialogResolver = resolve;
    });
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
    this.dialogState.next({
      ...this.initialState,
      isOpen: false
    });
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

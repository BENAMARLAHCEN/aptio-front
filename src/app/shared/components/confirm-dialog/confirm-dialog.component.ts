// src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ConfirmDialogService, ConfirmDialogState } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div *ngIf="dialogState.isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
        [@fadeInOut]
        (click)="onCancel()">
      </div>

      <!-- Dialog panel -->
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          [@slideInOut]>

          <!-- Dialog content -->
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <!-- Icon -->
              <div [ngClass]="getIconContainerClass()">
                <span
                  class="material-icons-outlined text-white text-lg"
                  [innerText]="getIconName()">
                </span>
              </div>

              <!-- Text content -->
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-lg font-medium leading-6 text-neutral-dark" id="modal-title">
                  {{ dialogState.title }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-neutral whitespace-pre-wrap">{{ dialogState.message }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Dialog buttons -->
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              [ngClass]="getConfirmButtonClass()"
              (click)="onConfirm()">
              {{ dialogState.confirmText }}
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:mr-3"
              (click)="onCancel()">
              {{ dialogState.cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('200ms ease-in-out'))
    ]),
    trigger('slideInOut', [
      state('void', style({ opacity: 0, transform: 'scale(0.95)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', animate('150ms ease-out')),
      transition('* => void', animate('150ms ease-in'))
    ])
  ]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  dialogState: ConfirmDialogState = {
    id: '',
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary'
  };

  private subscription: Subscription = new Subscription();

  constructor(private dialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    // Subscribe to dialog state changes
    this.subscription = this.dialogService.dialogState$.subscribe(state => {
      this.dialogState = state;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.subscription.unsubscribe();
  }

  onConfirm(): void {
    this.dialogService.close(true);
  }

  onCancel(): void {
    this.dialogService.close(false);
  }

  getIconName(): string {
    switch (this.dialogState.type) {
      case 'danger':
        return 'delete_forever';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'help';
    }
  }

  getIconContainerClass(): string {
    const baseClass = 'mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10';

    switch (this.dialogState.type) {
      case 'danger':
        return `${baseClass} bg-red-600`;
      case 'warning':
        return `${baseClass} bg-yellow-600`;
      case 'info':
        return `${baseClass} bg-blue-600`;
      default:
        return `${baseClass} bg-primary`;
    }
  }

  getConfirmButtonClass(): string {
    const baseClass = 'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm sm:ml-3 sm:w-auto';

    switch (this.dialogState.type) {
      case 'danger':
        return `${baseClass} bg-red-600 hover:bg-red-700`;
      case 'warning':
        return `${baseClass} bg-yellow-600 hover:bg-yellow-700`;
      case 'info':
        return `${baseClass} bg-blue-600 hover:bg-blue-700`;
      default:
        return `${baseClass} bg-primary hover:bg-primary-dark`;
    }
  }
}

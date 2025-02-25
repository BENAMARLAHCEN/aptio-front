import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent { }

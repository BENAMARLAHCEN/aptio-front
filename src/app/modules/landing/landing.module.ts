// src/app/modules/landing/landing.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LandingRoutingModule } from './landing-routing.module';
import { HomeComponent } from './components/home/home.component';
import { ServiceListComponent } from './components/service-list/service-list.component';
import { ServiceDetailsComponent } from './components/service-details/service-details.component';
import { LandingLayoutComponent } from './components/landing-layout/landing-layout.component';
import { NavbarComponent } from './components/landing-layout/navbar/navbar.component';
import { FooterComponent } from './components/landing-layout/footer/footer.component';

@NgModule({
  declarations: [
    HomeComponent,
    ServiceListComponent,
    ServiceDetailsComponent,
    LandingLayoutComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }

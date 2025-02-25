// src/app/modules/services/services.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesListComponent } from './components/services-list/services-list.component';
import { ServiceFormComponent } from './components/service-form/service-form.component';
import { ServiceDetailsComponent } from './components/service-details/service-details.component';
import { ServiceCategoriesComponent } from './components/service-categories/service-categories.component';

@NgModule({
  declarations: [
    ServicesListComponent,
    ServiceFormComponent,
    ServiceDetailsComponent,
    ServiceCategoriesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ServicesRoutingModule,
    FormsModule
  ]
})
export class ServicesModule { }

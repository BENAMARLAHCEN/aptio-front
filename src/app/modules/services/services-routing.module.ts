// src/app/modules/services/services-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicesListComponent } from './components/services-list/services-list.component';
import { ServiceFormComponent } from './components/service-form/service-form.component';
import { ServiceDetailsComponent } from './components/service-details/service-details.component';
import { ServiceCategoriesComponent } from './components/service-categories/service-categories.component';

const routes: Routes = [
  { path: '', component: ServicesListComponent },
  { path: 'new', component: ServiceFormComponent },
  { path: 'edit/:id', component: ServiceFormComponent },
  { path: 'categories', component: ServiceCategoriesComponent },
  { path: ':id', component: ServiceDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }

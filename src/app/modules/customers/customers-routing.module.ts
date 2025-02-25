// src/app/modules/customers/customers-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersListComponent } from './components/customers-list/customers-list.component';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';

const routes: Routes = [
  { path: '', component: CustomersListComponent },
  { path: 'new', component: CustomerFormComponent },
  { path: 'edit/:id', component: CustomerFormComponent },
  { path: ':id', component: CustomerDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }

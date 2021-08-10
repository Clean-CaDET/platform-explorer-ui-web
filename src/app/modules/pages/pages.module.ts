import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from 'src/app/app-routing.module'; 

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ]
})
export class PagesModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { DataSetModule } from './modules/data-set/data-set.module';
import { PagesModule } from './modules/pages/pages.module';
import { AppComponent } from './app.component';
import { ServerCommunicationService } from './server-communication/server-communication.service';
import { ToastrModule } from 'ngx-toastr';
import { AnnotationSchemaModule } from './modules/annotation-schema/annotation-schema.module';
import { NavbarComponent } from './modules/data-set/nav/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    DataSetModule,
    AnnotationSchemaModule,
    PagesModule,
    ToastrModule.forRoot()
  ],
  providers: [
    ServerCommunicationService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

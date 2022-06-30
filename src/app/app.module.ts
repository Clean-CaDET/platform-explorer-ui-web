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
import { NavbarComponent } from './modules/data-set/nav/navbar.component';
import { CommunityDetectionModule } from './modules/community-detection/community-detection.module';

@NgModule({
  declarations: [AppComponent, NavbarComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    DataSetModule,
    PagesModule,
    CommunityDetectionModule,
    ToastrModule.forRoot(),
  ],
  providers: [ServerCommunicationService],
  bootstrap: [AppComponent],
})
export class AppModule {}

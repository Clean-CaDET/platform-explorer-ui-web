import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { AppComponent } from './app.component';
import { ServerCommunicationService } from './server-communication/server-communication.service';
import { ToastrModule } from 'ngx-toastr';
import { CommunityDetectionModule } from './modules/community-detection/community-detection.module';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        CommunityDetectionModule,
        ToastrModule.forRoot()
    ],
    providers: [ServerCommunicationService, provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule {}

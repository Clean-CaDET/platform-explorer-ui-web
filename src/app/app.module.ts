import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ServerCommunicationService } from './server-communication/server-communication.service';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot()
    ],
    providers: [ServerCommunicationService, provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule {}

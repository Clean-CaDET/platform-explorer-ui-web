import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/shared/local-storage.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'de-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule
    ]
})
export class NavbarComponent {
  public annotationsCounter: boolean = false;

  constructor(
    private storageService: LocalStorageService,
    private router: Router
  ) {}

  public logout() {
    this.storageService.clearLocalStorage();
    this.router.navigate(['/login']);
  }

  public isLoggedIn() {
    return this.storageService.getLoggedInAnnotator() != null;
  }

  public goToDatasets() {
    this.router.navigate(['/datasets']);
  }

  public goToAnnotationSchema() {
    this.router.navigate(['/annotation-schema']);
  }

  public goToAnnotatorProfile() {
    this.router.navigate(['/profile']);
  }
}

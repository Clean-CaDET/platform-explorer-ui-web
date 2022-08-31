import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/shared/local-storage.service';

@Component({
  selector: 'de-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
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
}

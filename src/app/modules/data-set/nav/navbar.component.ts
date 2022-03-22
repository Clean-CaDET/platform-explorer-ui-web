import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { NotificationService } from '../services/shared/notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';


@Component({
  selector: 'de-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent implements OnInit {

  public annotationsCounter: boolean = false;

  constructor(private storageService: LocalStorageService, private router: Router) {
      
  }

  public ngOnInit(): void {
    if (!this.storageService.getLoggedInAnnotator()) this.router.navigate(['/login']);
  }

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
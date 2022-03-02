import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { AnnotationNotificationService } from '../services/shared/annotation-notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';


@Component({
  selector: 'de-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent implements OnInit {

  public annotationsCounter: boolean = false;

  constructor(private storageService: LocalStorageService, private router: Router,
    private annotationNotificationService: AnnotationNotificationService) {
      
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

  public toggleAutomaticMode(event: MatSlideToggleChange) {
    this.storageService.setAutoAnnotationMode(event.checked);
  }

  public toggleAnnotationsCounter(event: MatSlideToggleChange) {
    this.storageService.setAnnotationCounter(event.checked);
    this.annotationNotificationService.annotationCounter.emit();
  }
}
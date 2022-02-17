import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSet } from '../model/data-set/data-set.model';
import { Instance } from '../model/instance/instance.model';
import { AnnotationNotificationService } from '../services/shared/annotation-notification.service';
import { SessionStorageService } from '../services/shared/session-storage.service';


@Component({
  selector: 'de-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent implements OnInit {

  public chosenDataset: DataSet = new DataSet();
  public chosenProject: DataSetProject = new DataSetProject();
  public chosenInstance: Instance = new Instance(this.sessionService);
  public annotationsCounter: boolean = false;

  constructor(private sessionService: SessionStorageService, private router: Router,
    private annotationNotificationService: AnnotationNotificationService) {}

  public ngOnInit(): void {
      if (!this.isLoggedIn())this.router.navigate(['/login']);
      this.sessionService.clearAnnotationCounter();
      this.annotationNotificationService.datasetChosen.subscribe(dataset => {
        this.chosenDataset = dataset;
      });
      this.annotationNotificationService.projectChosen.subscribe(project => {
        this.chosenProject = project;
      });
      this.annotationNotificationService.instanceChosen.subscribe(instance => {
        this.chosenInstance = instance;
      });
      if (this.sessionService.getAnnotationCounter() == 'true') this.annotationsCounter = true;
      else this.annotationsCounter = false;
  }

  public logout() {
    this.sessionService.clearSessionStorage();
    this.resetChosen();
    this.router.navigate(['/login']);
  }

  public isLoggedIn() {
    return this.sessionService.getLoggedInAnnotator() != null;
  }

  public goToDatasets() {
    this.resetChosen();
    this.router.navigate(['/datasets']);
  }

  private resetChosen() {
    this.chosenDataset = new DataSet();
    this.chosenProject = new DataSetProject();
    this.chosenInstance = new Instance(this.sessionService);
  }

  public goToAnnotationSchema() {
    this.resetChosen();
    this.router.navigate(['/annotation-schema']);
  }

  public toggleAutomaticMode(event: MatSlideToggleChange) {
    this.sessionService.setAutoAnnotationMode(event.checked);
  }

  public toggleAnnotationsCounter(event: MatSlideToggleChange) {
    this.sessionService.setAnnotationCounter(event.checked);
    this.annotationNotificationService.annotationCounter.emit();
  }
}
import { Component, HostListener, OnInit } from '@angular/core';
import { DataSet } from '../model/data-set/data-set.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { Instance } from '../model/instance/instance.model';
import { ActivatedRoute, Params } from '@angular/router';
import { DataSetProjectService } from '../services/data-set-project.service';
import { DataSetService } from '../services/data-set.service';
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';
import { NotificationService } from '../services/shared/notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';


@Component({
  selector: 'de-data-set-detail',
  templateUrl: './data-set-detail.component.html',
  styleUrls: ['./data-set-detail.component.css']
})

export class DataSetDetailComponent implements OnInit {

  public chosenDataset: DataSet = new DataSet();
  public chosenProject: DataSetProject = new DataSetProject();
  public chosenInstance: Instance = new Instance(this.storageService);
  public annotatedInstancesNum: number = 0;
  public panelOpenState = false;
  public automaticAnnotationMode = false;

  constructor(private route: ActivatedRoute, public storageService: LocalStorageService, 
    private projectService: DataSetProjectService, private datasetService: DataSetService, 
    private annotationNotificationService: NotificationService) {
      this.annotationNotificationService.newAnnotation.subscribe(annotation => {
        this.annotatedInstancesNum++;
        if (this.chosenProject.countAnnotatedInstances() == this.chosenProject.instancesCount) {
          var i = this.chosenDataset.projects.findIndex(p => p.id == this.chosenProject.id);
          this.chosenDataset.projects[i].fullyAnnotated = true;
        }
      });
      this.annotationNotificationService.instanceChosen.subscribe(async instance => {
        this.chosenInstance = instance;
        this.chosenProject = new DataSetProject(await this.projectService.getProject(this.chosenInstance.projectId));
      });
      this.annotationNotificationService.projectChosen.subscribe(res => {
        this.chosenProject = res['project'];
      });
  }

  public ngOnInit() {
    this.storageService.clearAutoAnnotationMode();
    this.route.params.subscribe(async (params: Params) => {
      this.loadDataset(params);
    });
  }

  private async loadDataset(params: Params) {
    this.chosenDataset = new DataSet(await this.datasetService.getDataSet(params['id']));
    this.annotationNotificationService.datasetChosen.emit(this.chosenDataset);
    this.countAnnotatedDatasetInstances();
  }

  public loadPreviousInstance() {
      this.annotationNotificationService.previousInstance.emit(this.chosenInstance.id);
  }

  public loadNextInstance() {
    this.annotationNotificationService.nextInstance.emit(this.chosenInstance.id);
  }
  
  @HostListener('window:keydown', ['$event'])
  public next(event: KeyboardEvent) {
    if (!this.chosenInstance.id) return;
    if (event.ctrlKey && event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      this.loadNextInstance();
    } else if (event.ctrlKey && event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      this.loadPreviousInstance();
    }
  }

  private countAnnotatedDatasetInstances() {
    this.annotatedInstancesNum = 0;
    this.chosenDataset.projects.forEach(async (project, index) => {
      if (!project.candidateInstances) project = new DataSetProject(await this.projectService.getProject(project.id));
      var counted = this.countAnnotatedProjectInstances(project.candidateInstances);
      if (counted == project.instancesCount) this.chosenDataset.projects[index].fullyAnnotated = true;
      this.annotatedInstancesNum += counted;
    });
  }

  private countAnnotatedProjectInstances(candidates: SmellCandidateInstances[]): number {
    var counter = 0;
    candidates.forEach(candidate => {
      candidate.instances.forEach(instance => {
        instance.annotations.forEach(annotation => {
          if (annotation.annotator.id+'' == this.storageService.getLoggedInAnnotator()) {
            counter++;
          }
        });
      });
    });
    return counter;
  }

  public toggleAutomaticMode() {
    this.storageService.setAutoAnnotationMode(this.automaticAnnotationMode);
  }
}

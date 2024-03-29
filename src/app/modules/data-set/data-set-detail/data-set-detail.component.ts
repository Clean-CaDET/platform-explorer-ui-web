import { Component, OnInit } from '@angular/core';
import { DataSet } from '../model/data-set/data-set.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { Instance } from '../model/instance/instance.model';
import { ActivatedRoute, Params } from '@angular/router';
import { DataSetProjectService } from '../services/data-set-project.service';
import { DataSetService } from '../services/data-set.service';
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';
import {
  DatasetChosenEvent,
  InstanceChosenEvent,
  NewAnnotationEvent,
  NextInstanceEvent,
  NotificationEvent,
  NotificationService,
  PreviousInstanceEvent,
  ProjectChosenEvent,
} from '../services/shared/notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';
import { Subscription } from 'rxjs';
import { GraphService } from '../../community-detection/services/graph.service';
import { Annotation } from '../model/annotation/annotation.model';

@Component({
  selector: 'de-data-set-detail',
  templateUrl: './data-set-detail.component.html',
  styleUrls: ['./data-set-detail.component.css'],
})
export class DataSetDetailComponent implements OnInit {
  public chosenDataset: DataSet = new DataSet();
  public chosenProject: DataSetProject = new DataSetProject();
  public chosenInstance: Instance = new Instance(this.storageService);
  public annotatedInstancesNum: number = 0;
  public panelOpenState = false;
  public automaticAnnotationMode = false;

  private notificationSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    public storageService: LocalStorageService,
    private projectService: DataSetProjectService,
    private datasetService: DataSetService,
    private notificationService: NotificationService,
    private graphService: GraphService
  ) {}

  public ngOnInit() {
    this.notificationSubscription = this.notificationService
      .getEvent()
      .subscribe(async (event: NotificationEvent) => {
        if (event instanceof NewAnnotationEvent) {
          this.updateAnnotationInfo(event.annotation);
        } else if (event instanceof ProjectChosenEvent) {
          this.chosenProject = event.data['project'];
        } else if (event instanceof InstanceChosenEvent) {
          this.loadProjectBasedOnInstance(event.instance);
        }
      });

    this.storageService.clearAutoAnnotationMode();
    this.route.params.subscribe((params: Params) => {
      this.loadDataset(params);
    });
  }

  private updateAnnotationInfo(newAnnotation: Annotation) {
    this.annotatedInstancesNum++;
    if (this.chosenInstance.annotations == null) this.chosenInstance.annotations = [];
    this.chosenInstance.annotations.push(newAnnotation);
    if (
      this.chosenProject.countAnnotatedInstances(this.storageService, this.chosenInstance) ==
      this.chosenProject.instancesCount
    ) {
      var i = this.chosenDataset.projects.findIndex(
        (p) => p.id == this.chosenProject.id
      );
      this.chosenDataset.projects[i].fullyAnnotated = true;
    }
  }

  private async loadProjectBasedOnInstance(instance: Instance) {
    this.chosenInstance = instance;
    this.chosenProject = new DataSetProject(
      await this.projectService.getProject(this.chosenInstance.projectId)
    );
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
  }

  private loadDataset(params: Params) {
    this.datasetService.getDataSet(params['id']).then((dataset) => {
      this.chosenDataset = new DataSet(dataset);
      this.notificationService.setEvent(
        new DatasetChosenEvent(this.chosenDataset)
      );
      this.countAnnotatedDatasetInstances();
    });
  }

  private countAnnotatedDatasetInstances() {
    this.annotatedInstancesNum = 0;
    this.chosenDataset.projects.forEach(async (project, index) => {
      if (!project.candidateInstances)
        project = new DataSetProject(
          await this.projectService.getProject(project.id)
        );
      var counted = this.countAnnotatedProjectInstances(
        project.candidateInstances
      );
      if (counted == project.instancesCount)
        this.chosenDataset.projects[index].fullyAnnotated = true;
      this.annotatedInstancesNum += counted;
    });
  }

  private countAnnotatedProjectInstances(
    candidates: SmellCandidateInstances[]
  ): number {
    var counter = 0;
    candidates.forEach((candidate) => {
      candidate.instances.forEach((instance) => {
        instance.annotations.forEach((annotation) => {
          if (
            annotation.annotator.id + '' ==
            this.storageService.getLoggedInAnnotator()
          ) {
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

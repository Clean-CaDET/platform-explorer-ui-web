import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { DialogConfigService } from "../dialogs/dialog-config.service";
import { DisagreeingAnnotationsDialogComponent } from "../dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component";
import { Annotation } from "../model/annotation/annotation.model";
import { DataSetProject } from "../model/data-set-project/data-set-project.model";
import { DataSet } from "../model/data-set/data-set.model";
import { AnnotationStatus } from "../model/enums/enums.model";
import { Instance } from "../model/instance/instance.model";
import { AnnotationService } from "../services/annotation.service";
import { DataSetProjectService } from "../services/data-set-project.service";
import { ChangedAnnotationEvent, DatasetChosenEvent, InstanceChosenEvent, NewAnnotationEvent, NextInstanceEvent, NotificationEvent, NotificationService, PreviousInstanceEvent, ProjectChosenEvent } from "../services/shared/notification.service";
import { LocalStorageService } from "../services/shared/local-storage.service";
import { Subscription } from "rxjs";
import { CodeSmell } from "../model/code-smell/code-smell.model";

@Component({
    selector: 'de-instances',
    templateUrl: './instances.component.html',
    styleUrls: ['./instances.component.css']
})
  
export class InstancesComponent implements OnInit {

    public chosenProject: DataSetProject = new DataSetProject();
    public chosenDataset: DataSet = new DataSet();
    public chosenInstance: Instance = new Instance(this.storageService);

    public dataSource: MatTableDataSource<Instance> = new MatTableDataSource<Instance>();
    private initColumns: string[] = ['codeSnippetId', 'annotated', 'severity'];
    public displayedColumns: string[] = this.initColumns;
    public searchInput: string = '';
    public selectedAnnotationStatus: AnnotationStatus = AnnotationStatus.All;
    public annotationStatuses: string[] = Object.keys(AnnotationStatus);
    public selectedSeverity: string | null = null;
    public severities: Set<string|null> = new Set();
    public codeSmells: string[] = [];
    public selectedSmellFormControl = new FormControl('', Validators.required);
    public filter: string = 'All instances';

    private notificationSubscription: Subscription | undefined;
    
    constructor(private route: ActivatedRoute, private dialog: MatDialog, private router: Router,
      public storageService: LocalStorageService, private annotationService: AnnotationService,
      private notificationService: NotificationService,
      private projectService: DataSetProjectService, private location: Location) {
    }

    ngOnInit(): void {
      this.notificationSubscription = this.notificationService.getEvent()
        .subscribe((event: NotificationEvent) => {
            if (event instanceof NewAnnotationEvent || event instanceof ChangedAnnotationEvent) {
              this.annotationSubmitted(event.annotation);
            } else if (event instanceof DatasetChosenEvent) {
              this.datasetChosen(event.dataset);
            } else if (event instanceof ProjectChosenEvent) {
              this.filterInstancesForProject(event.data);
            } else if (event instanceof InstanceChosenEvent) {
              if (this.chosenDataset.name != "") this.loadInstance(event.instance);
            } else if (event instanceof NextInstanceEvent) {
              this.loadNextInstance(event.currentInstanceId);
            } else if (event instanceof PreviousInstanceEvent) {
              this.loadPreviousInstance(event.currentInstanceId);
            }
      });
      this.loadProjectBasedOnUrl();
    }

    private loadProjectBasedOnUrl() {
      this.route.firstChild?.params.subscribe(async (params: Params) => {
        if (params['projectId'] && params['instanceId']) {
          this.updateCandidates(params['projectId'], params['instanceId']).then(() => this.chooseInstanceBasedOnUrl(params['instanceId']));
        }
      });
    }

    private chooseInstanceBasedOnUrl(instanceId: number) {
      this.chosenProject.candidateInstances.forEach(candidate => {
        candidate.instances.forEach(instance => {
          if (instance.id == instanceId) this.chosenInstance = instance;
        });
      });
    }

    ngOnDestroy(): void {
      this.notificationSubscription?.unsubscribe();
    }

    private annotationSubmitted(annotation: Annotation) {
      this.updateInstancesTable(annotation);
      this.initSeverities();
      if (this.storageService.getAutoAnnotationMode() == 'true') this.loadNextInstance(this.chosenInstance.id);
    }

    private updateInstancesTable(annotation: Annotation) {
      this.storageService.setSmellFilter(annotation.instanceSmell.name);
      var candidateInstances = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
      var annotatedInstance = candidateInstances.find(i => i.id == this.chosenInstance.id);
      if (!annotatedInstance) return;
      annotatedInstance.annotationFromLoggedUser = annotation;
      annotatedInstance.hasAnnotationFromLoggedUser = true;
    }

    private initSeverities() {
      this.severities.clear();
      this.severities.add(null);
      this.dataSource.data.forEach((i:any) => {
        if (i.annotationFromLoggedUser?.severity != null) this.severities.add(i.annotationFromLoggedUser?.severity);
      });
    }

    private datasetChosen(dataset: DataSet) {
      this.chosenDataset = dataset;
      this.chosenProject = new DataSetProject();
      this.chosenInstance = new Instance(this.storageService);
    }

    private filterInstancesForProject(data: any) {
      this.chosenProject = data['project'];
      this.filter = data['filter'];
      this.filterInstances(this.chosenProject.id);
    }

    public async filterInstances(id: number) {
      if (this.filter == 'All instances') {
        this.chosenProject = new DataSetProject(await this.projectService.getProject(id));
        this.removeDisagreeingAnnotationsColumn();
      } else if (this.filter == 'Need additional annotations') {
        this.chosenProject.candidateInstances = await this.annotationService.requiringAdditionalAnnotation(id);
        this.removeDisagreeingAnnotationsColumn();
      } else {
        this.chosenProject.candidateInstances = await this.annotationService.disagreeingAnnotations(id);
        this.addDisagreeingAnnotationsColumn();
      }
      this.initSmellSelection();
      this.initInstances();
      this.initSeverities();
    }

    private addDisagreeingAnnotationsColumn() {
      if (this.initColumns.findIndex(c => c == 'show-annotations') == -1) this.initColumns.push('show-annotations');
    }
    
    private removeDisagreeingAnnotationsColumn() {
      if (this.initColumns.findIndex(c => c == 'show-annotations') != -1) this.initColumns.pop();
    }

    private initSmellSelection() {
      this.initCodeSmellDropList();
      var currentSmellFilter = this.storageService.getSmellFilter();
      if (!currentSmellFilter) {
        this.storageService.setSmellFilter(this.codeSmells[0]);
        this.selectedSmellFormControl.setValue(this.codeSmells[0]);
      } else  {
        this.selectedSmellFormControl.setValue(currentSmellFilter);
      }
    }

    private initCodeSmellDropList() {
      this.codeSmells = [];
      this.chosenProject.candidateInstances.forEach(candidate => this.codeSmells.push(candidate.codeSmell?.name!));
    }

    private initInstances() {
      this.searchInput = '';
      this.chosenProject.candidateInstances.forEach(candidate => {
        candidate.instances.forEach((instance, index) => candidate.instances[index] = new Instance(this.storageService, instance));
      });
      this.dataSource.data = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
    }

    private chooseDefaultInstance() {
      if (this.chosenProject.hasInstances()) this.chooseInstance(this.dataSource.data[0].id);
    }

    public chooseInstance(id: number): void {
      this.chosenInstance.id = id;
      this.router.navigate(['datasets/' + this.chosenDataset.id + '/projects/' + this.chosenProject.id + '/instances', id]);
    }

    private loadInstance(instance: Instance) {
      this.chosenInstance = instance;
      this.updateCandidates(this.chosenInstance.projectId, this.chosenInstance.id);
    }

    private async updateCandidates(projectId: number, instanceId: number) {
      this.chosenProject = new DataSetProject(await this.projectService.getProject(projectId));
      this.initCodeSmellDropList();
      this.chosenProject.candidateInstances.forEach(candidate => {
        candidate.instances.forEach((instance, index) => {
          candidate.instances[index] = new Instance(this.storageService, instance);
          if (instance.id == instanceId) {
            this.storageService.setSmellFilter(candidate.codeSmell?.name!);
            this.selectedSmellFormControl.setValue(candidate.codeSmell?.name);
          }
        });
      });
      this.dataSource.data = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
      this.initSeverities();
      this.filterInstances(projectId);
    }

    public loadNextInstance(currentInstanceId: number) {
      var candidateInstances = this.chosenProject.getCandidateInstancesForSmell(this.selectedSmellFormControl.value);
      var currentInstanceIndex = candidateInstances.findIndex(i => i.id == currentInstanceId);
      if (currentInstanceIndex == candidateInstances.length-1) this.loadNextProjectInstance();
      else this.chooseInstance(candidateInstances[currentInstanceIndex+1].id);
    }

    private loadNextProjectInstance() {
      var nextProject = this.chosenDataset.getNextProject(this.chosenProject.id);
      if (nextProject) { 
        this.filterInstances(nextProject.id).then(() => {
            this.chooseDefaultInstance();
        }).then(() => {
            var candidateInstances = this.chosenProject.getCandidateInstancesForSmell(this.selectedSmellFormControl.value);
            if (candidateInstances.length > 0) {
              this.chosenInstance = candidateInstances[0];
              this.notificationService.setEvent(new InstanceChosenEvent(this.chosenInstance));
              this.location.replaceState('/datasets/'+this.chosenDataset.id+'/projects/'+this.chosenProject.id+'/instances/'+this.chosenInstance.id);
            }
        });
      }
    }

    public loadPreviousInstance(currentInstanceId: number) {
      var candidateInstances = this.chosenProject.getCandidateInstancesForSmell(this.selectedSmellFormControl.value);
      var currentInstanceIndex = candidateInstances.findIndex(i => i.id == currentInstanceId);
      if (currentInstanceIndex == 0) this.loadPreviousProjectInstance();
      else this.chooseInstance(candidateInstances[currentInstanceIndex-1].id);
    }

    private async loadPreviousProjectInstance() {
      var previousProject = this.chosenDataset.getPreviousProject(this.chosenProject.id);
      if (!previousProject) return;
      else this.chosenProject = previousProject;

      this.chosenProject.candidateInstances = new DataSetProject(await this.projectService.getProject(previousProject.id)).candidateInstances;
      this.initSmellSelection();
      this.initInstances();
      this.initSeverities();
      this.chooseLastInstance();
    }

    private chooseLastInstance() {
      var lastInstance = this.chosenProject.getLastInstanceForSmell(this.selectedSmellFormControl.value);
      if (!lastInstance) return;
      this.chooseInstance(lastInstance.id);
    }

    public searchInstances(): void {
      var instances = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
      if (this.selectedSeverity != null) {
        var instancesWithSelectedSeverity = instances.filter(i => i.annotationFromLoggedUser?.severity == this.selectedSeverity)!;
        this.dataSource.data = this.filterInstancesByName(instancesWithSelectedSeverity);
      } else {
        this.dataSource.data = this.filterInstancesByName(instances);
      }
    }

    private filterInstancesByName(instances: Instance[]) {
      return instances.filter(i => i.codeSnippetId.toLowerCase().includes(this.searchInput.toLowerCase()))!;
    }

    public filterByAnnotationStatus() {
      var instances = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
      switch (this.selectedAnnotationStatus) {
        case AnnotationStatus.Annotated: {
          this.dataSource.data = instances.filter(i => i.hasAnnotationFromLoggedUser)!;
          return;
        }
        case AnnotationStatus.Not_Annotated: { 
          this.dataSource.data = instances.filter(i => !i.hasAnnotationFromLoggedUser)!;
          return;
        } 
        case AnnotationStatus.All: { 
          this.dataSource.data = instances;
        } 
      }
    }

    public filterBySeverity() {
      this.selectedAnnotationStatus = AnnotationStatus.All;
      var instances = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
      if (this.selectedSeverity == null) this.dataSource.data = instances;
      else this.dataSource.data = instances.filter(i => i.annotationFromLoggedUser?.severity == this.selectedSeverity)!;
    }

    public showAnnotationsForInstance(annotations: Annotation[], instanceId: number): void {
      annotations.forEach(ann => {
        ann.instanceSmell = new CodeSmell({name: this.selectedSmellFormControl.value});
      });
      let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', {annotations: annotations, instanceId: instanceId});
      this.dialog.open(DisagreeingAnnotationsDialogComponent, dialogConfig);
    }

    public smellSelectionChanged() {
      this.searchInput = '';
      this.storageService.setSmellFilter(this.selectedSmellFormControl.value);
      this.dataSource.data = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
      this.initSeverities();
      this.selectedAnnotationStatus = AnnotationStatus.All;
      this.chooseDefaultInstance();
    }
}
import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { DialogConfigService } from "../dialogs/dialog-config.service";
import { DisagreeingAnnotationsDialogComponent } from "../dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component";
import { Annotation } from "../model/annotation/annotation.model";
import { DataSetProject } from "../model/data-set-project/data-set-project.model";
import { DataSet } from "../model/data-set/data-set.model";
import { AnnotationStatus } from "../model/enums/enums.model";
import { Instance } from "../model/instance/instance.model";
import { AnnotationService } from "../services/annotation.service";
import { DataSetProjectService } from "../services/data-set-project.service";
import { NotificationService } from "../services/shared/notification.service";
import { LocalStorageService } from "../services/shared/local-storage.service";
import { Subscription } from "rxjs";

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
    public selectedSeverity: number | null = null;
    public severityValues: Set<number|null> = new Set();
    public codeSmells: string[] = [];
    public selectedSmellFormControl = new FormControl('', Validators.required);
    public filter: string = 'All instances';
    
    private datasetChosenSub: Subscription | undefined;
    private projectChosenSub: Subscription | undefined;
    private instanceChosenSub: Subscription | undefined;
    private nextInstanceSub: Subscription | undefined;
    private previousInstanceSub: Subscription | undefined;
    private newAnnotationSub: Subscription | undefined;
    private changedAnnotationSub: Subscription | undefined;
    
    constructor(private dialog: MatDialog, private router: Router,
      public storageService: LocalStorageService, private annotationService: AnnotationService,
      private annotationNotificationService: NotificationService,
      private projectService: DataSetProjectService, private location: Location) {
    }

    ngOnInit(): void {
      this.datasetChosenSub = this.annotationNotificationService.datasetChosen.subscribe((dataset: DataSet) => {
        this.chosenDataset = dataset;
      });
      this.projectChosenSub = this.annotationNotificationService.projectChosen.subscribe((res: any) => {
        this.chosenProject = res['project'];
        this.filter = res['filter'];
        this.filterInstances(this.chosenProject.id).then(() => {
          this.chooseDefaultInstance();
        });
      });
      this.instanceChosenSub = this.annotationNotificationService.instanceChosen.subscribe(instance => {
        this.chosenInstance = instance;
        this.updateCandidates();
        this.scrollToSelectedInstance();
      });
      this.nextInstanceSub = this.annotationNotificationService.nextInstance.subscribe((currentInstanceId) => {
        this.loadNextInstance(currentInstanceId);
      });
      this.previousInstanceSub = this.annotationNotificationService.previousInstance.subscribe((currentInstanceId) => {
        this.loadPreviousInstance(currentInstanceId);
      });
      this.newAnnotationSub = this.annotationNotificationService.newAnnotation.subscribe(annotation => {
        this.annotationSubmitted(annotation);
      });
      this.changedAnnotationSub = this.annotationNotificationService.changedAnnotation.subscribe(annotation => {
        this.annotationSubmitted(annotation);
      });
    }

    ngOnDestroy(): void {
      this.datasetChosenSub?.unsubscribe();
      this.projectChosenSub?.unsubscribe();
      this.instanceChosenSub?.unsubscribe();
      this.nextInstanceSub?.unsubscribe();
      this.previousInstanceSub?.unsubscribe();
      this.newAnnotationSub?.unsubscribe();
      this.changedAnnotationSub?.unsubscribe();
    }

    private scrollToSelectedInstance() {
      setTimeout(() => {
        const selectedRow = document.getElementById('row-'+this.chosenInstance.id);
        if(selectedRow) {
          selectedRow.scrollIntoView({block: 'center'});
        }
      }, 500);
    }

    private async updateCandidates() {
      this.chosenProject = new DataSetProject(await this.projectService.getProject(this.chosenInstance.projectId));
      this.initCodeSmellDropList();
      this.chosenProject.candidateInstances.forEach(candidate => {
        candidate.instances.forEach((instance, index) => {
          candidate.instances[index] = new Instance(this.storageService, instance);
          if (instance.id == this.chosenInstance.id) {
            this.storageService.setSmellFilter(candidate.codeSmell?.name!);
            this.selectedSmellFormControl.setValue(candidate.codeSmell?.name);
          }
        });
      });
      this.dataSource.data = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
      this.initSeverities();
    }

    private initCodeSmellDropList() {
      this.codeSmells = [];
      this.chosenProject.candidateInstances.forEach(candidate => this.codeSmells.push(candidate.codeSmell?.name!));
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

    public chooseInstance(id: number): void {
      this.chosenInstance.id = id;
      this.router.navigate(['datasets/' + this.chosenDataset.id + '/instances', id]);
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

    public showAllAnnotations(annotations: Annotation[], instanceId: number): void {
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

    private initSeverities() {
      this.severityValues.clear();
      this.severityValues.add(null);
      this.dataSource.data.forEach((i:any) => {
        if (i.annotationFromLoggedUser?.severity != null) this.severityValues.add(i.annotationFromLoggedUser?.severity);
      });
    }

    private chooseDefaultInstance() {
      if (this.chosenProject.hasInstances()) this.chooseInstance(this.dataSource.data[0].id);
    }

    public async filterInstances(id: number) {
      if (this.filter == 'All instances') {
        this.chosenProject = new DataSetProject(await this.projectService.getProject(id));
      } else if (this.filter == 'Need additional annotations') {
        this.chosenProject.candidateInstances = await this.annotationService.requiringAdditionalAnnotation(id);
      } else {
        this.chosenProject.candidateInstances = await this.annotationService.disagreeingAnnotations(id);
      }
      this.initSmellSelection();
      this.initInstances();
      this.initSeverities();
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

    private initInstances() {
      this.searchInput = '';
      this.chosenProject.candidateInstances.forEach(candidate => {
        candidate.instances.forEach((instance, index) => candidate.instances[index] = new Instance(this.storageService, instance));
      });
      this.dataSource.data = this.chosenProject.getCandidateInstancesForSmell(this.storageService.getSmellFilter());
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
              this.annotationNotificationService.instanceChosen.emit(this.chosenInstance);
              this.location.replaceState('/datasets/'+this.chosenDataset.id+'/instances/'+this.chosenInstance.id);
            }
        });
      }
    }
}
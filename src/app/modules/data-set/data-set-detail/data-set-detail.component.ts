import { Component, HostListener, OnInit } from '@angular/core';
import { DataSet } from '../model/data-set/data-set.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { AnnotationStatus } from '../model/enums/enums.model';
import { Instance } from '../model/instance/instance.model';
import { Annotation } from '../model/annotation/annotation.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { DialogConfigService } from '../dialogs/dialog-config.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators } from '@angular/forms';
import { DisagreeingAnnotationsDialogComponent } from '../dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component';
import { DataSetProjectService } from '../services/data-set-project.service';
import { DataSetService } from '../services/data-set.service';
import { Location } from '@angular/common';
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';
import { AnnotationNotificationService } from '../services/shared/annotation-notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';
import { AnnotationService } from '../services/annotation.service';


@Component({
  selector: 'de-data-set-detail',
  templateUrl: './data-set-detail.component.html',
  styleUrls: ['./data-set-detail.component.css']
})

export class DataSetDetailComponent implements OnInit {

  public chosenDataset: DataSet = new DataSet();
  public chosenProject: DataSetProject = new DataSetProject();// todo maybe only candidates
  public annotatedInstancesNum: number = 0;
  public dataSourceInstances: MatTableDataSource<Instance> = new MatTableDataSource<Instance>();
  private initColumnsInstances: string[] = ['codeSnippetId', 'annotated', 'severity'];
  public displayedColumnsInstances: string[] = this.initColumnsInstances;
  public searchInput: string = '';
  public annotationStatuses: string[] = Object.keys(AnnotationStatus);
  public selectedAnnotationStatus: AnnotationStatus = AnnotationStatus.All;
  public severityValues: Set<number|null> = new Set();
  public selectedSeverity: number | null = null;
  public codeSmells: string[] = [];
  public selectedSmellFormControl = new FormControl('', Validators.required);
  public chosenInstance: Instance = new Instance(this.storageService);
  public panelOpenState = false;
  public automaticAnnotationMode = false;
  public filter: string = 'All instances';

  constructor(private route: ActivatedRoute, public storageService: LocalStorageService, 
    private projectService: DataSetProjectService, private datasetService: DataSetService, 
    private dialog: MatDialog, private toastr: ToastrService, private location: Location, 
    private annotationNotificationService: AnnotationNotificationService,
    private router: Router, private annotationService: AnnotationService) {
      this.annotationNotificationService.newAnnotation.subscribe(annotation => {
        this.annotationSubmitted(annotation);
        this.annotatedInstancesNum++;
        if (this.chosenProject.countAnnotatedInstances() == this.chosenProject.instancesCount) {
          var i = this.chosenDataset.projects.findIndex(p => p.id == this.chosenProject.id);
          this.chosenDataset.projects[i].fullyAnnotated = true;
        }
      });
      this.annotationNotificationService.changedAnnotation.subscribe(annotation => {
        this.annotationSubmitted(annotation);
      });
      this.annotationNotificationService.instanceChosen.subscribe(instance => {
        this.chosenInstance = instance;
        this.updateCandidates();
      });
      this.annotationNotificationService.projectChosen.subscribe((res: any) => {
        this.chosenProject = res['project'];
        this.filter = res['filter'];
        this.filterInstances(this.chosenProject.id).then(() => {
          this.chooseDefaultInstance();
        });
      })
  }

  private async updateCandidates() {
    this.chosenProject = new DataSetProject(await this.projectService.getProject(this.chosenInstance.projectId));
    this.codeSmells = [];
    this.chosenProject.candidateInstances.forEach(candidate => this.codeSmells.push(candidate.codeSmell?.name!));
    this.chosenProject.candidateInstances.forEach(candidate => {
      candidate.instances.forEach((instance, index) => {
        candidate.instances[index] = new Instance(this.storageService, instance);
        if (instance.id == this.chosenInstance.id) {
          this.storageService.setSmellFilter(candidate.codeSmell?.name!);
          this.selectedSmellFormControl.setValue(candidate.codeSmell?.name);
        }
      });
    });
    this.dataSourceInstances.data = this.filterInstancesBySmell();
    this.initSeverities();
  }

  public ngOnInit() {
    this.storageService.clearAutoAnnotationMode();
    this.route.params.subscribe(async (params: Params) => {
      this.loadDataset(params).then(() => {
          if (params['instanceId']) this.chooseInstance(params['instanceId']);
      });
    });
  }

  private async loadDataset(params: Params) {
    this.chosenDataset = new DataSet(await this.datasetService.getDataSet(params['id']));
    this.annotationNotificationService.datasetChosen.emit(this.chosenDataset);
    this.countAnnotatedDatasetInstances();
  }

  private annotationSubmitted(annotation: Annotation) {
    this.updateInstancesTable(annotation);
    this.initSeverities();
    if (this.storageService.getAutoAnnotationMode() == 'true') this.loadNextInstance();
  }

  private updateInstancesTable(annotation: Annotation) {
    this.storageService.setSmellFilter(annotation.instanceSmell.name);
    var annotatedInstance = this.filterInstancesBySmell().find(i => i.id == this.chosenInstance.id);
    if (!annotatedInstance) return;
    annotatedInstance.annotationFromLoggedUser = annotation;
    annotatedInstance.hasAnnotationFromLoggedUser = true;
  }

  public loadNextInstance() {
    var projectInstances = this.getProjectInstances(this.chosenProject);
    var currentInstanceIndex = projectInstances.findIndex(i => i.id == this.chosenInstance.id);
    if (currentInstanceIndex == projectInstances.length-1) this.loadNextProjectInstance();
    else this.chooseInstance(projectInstances[currentInstanceIndex+1].id);
  }

  public loadPreviousInstance() {
    var projectInstances = this.getProjectInstances(this.chosenProject);
    var currentInstanceIndex = projectInstances.findIndex(i => i.id == this.chosenInstance.id);
    if (currentInstanceIndex == 0) this.loadPreviousProjectInstance();
    else this.chooseInstance(projectInstances[currentInstanceIndex-1].id);
  }

  private getProjectInstances(project: DataSetProject): Instance[] {
    var allInstances: Instance[] = [];
    project.candidateInstances.forEach(candidate => {
      if (candidate.codeSmell?.name == this.selectedSmellFormControl.value) {
        candidate.instances.forEach(instance => {
          allInstances.push(instance);
        });
      }
    });
    return allInstances;
  }

  private loadNextProjectInstance() {
    var nextProject = this.getNextProject();
    if (nextProject) { 
      this.filterInstances(nextProject.id).then(() => {
        this.chooseDefaultInstance();
      }).then(() => {
        var projectInstances = this.getProjectInstances(this.chosenProject);
        if (projectInstances.length > 0) {
          this.chosenInstance = projectInstances[0];
          this.annotationNotificationService.instanceChosen.emit(this.chosenInstance);
          this.location.replaceState('/datasets/'+this.chosenDataset.id+'/instances/'+this.chosenInstance.id);
        }
      });
    }
  }

  private async loadPreviousProjectInstance() {
    var previousProject = this.getPreviousProject();
    if (!previousProject) return;
    else this.chosenProject = previousProject;

    this.chosenProject.candidateInstances = new DataSetProject(await this.projectService.getProject(previousProject.id)).candidateInstances;
    this.initSmellSelection();
    this.initInstances();
    this.initSeverities();
    this.getLastInstance();
  }

  private getLastInstance() {
    var projectInstances = this.getProjectInstances(this.chosenProject);
    if (projectInstances.length > 0) {
      this.chosenInstance = projectInstances[projectInstances.length-1];
      this.router.navigate(['datasets/' + this.chosenDataset.id + '/instances', this.chosenInstance.id]);
    }
  }

  private getNextProject() {
    var currentProjectId = this.chosenDataset.projects.findIndex(p => p.id == this.chosenProject.id);
    if (currentProjectId == this.chosenDataset.projects.length-1) return null;
    else return this.chosenDataset.projects[currentProjectId+1];
  }

  private getPreviousProject() {
    var currentProjectId = this.chosenDataset.projects.findIndex(p => p.id == this.chosenProject.id);
    if (currentProjectId == 0) return null;
    else return this.chosenDataset.projects[currentProjectId-1];
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

  private chooseDefaultInstance() {
    if (this.chosenProject.hasInstances()) this.chooseInstance(this.dataSourceInstances.data[0].id);
  }

  private initSmellSelection() {
    this.codeSmells = [];
    this.chosenProject.candidateInstances.forEach(candidate => this.codeSmells.push(candidate.codeSmell?.name!));
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
    this.dataSourceInstances.data = this.filterInstancesBySmell();
  }

  private filterInstancesBySmell(): Instance[] {
    return this.chosenProject.candidateInstances.find(c => c.codeSmell?.name == this.storageService.getSmellFilter())?.instances!;
  }

  private initSeverities() {
    this.severityValues.clear();
    this.severityValues.add(null);
    this.dataSourceInstances.data.forEach((i:any) => {
      if (i.annotationFromLoggedUser?.severity != null) this.severityValues.add(i.annotationFromLoggedUser?.severity);
    });
  }

  public searchInstances(): void {
    var instances = this.filterInstancesBySmell();
    if (this.selectedSeverity != null) {
      var instancesWithSelectedSeverity = instances.filter(i => i.annotationFromLoggedUser?.severity == this.selectedSeverity)!;
      this.dataSourceInstances.data = this.filterInstancesByName(instancesWithSelectedSeverity);
    } else {
      this.dataSourceInstances.data = this.filterInstancesByName(instances);
    }
  }

  private filterInstancesByName(instances: Instance[]) {
    return instances.filter(i => i.codeSnippetId.toLowerCase().includes(this.searchInput.toLowerCase()))!;
  }

  public filterBySeverity() {
    this.selectedAnnotationStatus = AnnotationStatus.All;
    var instances = this.filterInstancesBySmell();
    if (this.selectedSeverity == null) this.dataSourceInstances.data = instances;
    else this.dataSourceInstances.data = instances.filter(i => i.annotationFromLoggedUser?.severity == this.selectedSeverity)!;
  }

  public filterByAnnotationStatus() {
    var instances = this.filterInstancesBySmell();
    switch (this.selectedAnnotationStatus) {
      case AnnotationStatus.Annotated: {
        this.dataSourceInstances.data = instances.filter(i => i.hasAnnotationFromLoggedUser)!;
        return;
      }
      case AnnotationStatus.Not_Annotated: { 
        this.dataSourceInstances.data = instances.filter(i => !i.hasAnnotationFromLoggedUser)!;
        return;
      } 
      case AnnotationStatus.All: { 
        this.dataSourceInstances.data = instances;
      } 
    }
  }

  public smellSelectionChanged() {
    this.searchInput = '';
    this.storageService.setSmellFilter(this.selectedSmellFormControl.value);
    this.dataSourceInstances.data = this.filterInstancesBySmell();
    this.initSeverities();
    this.selectedAnnotationStatus = AnnotationStatus.All;
    this.chooseDefaultInstance();
  }

  public chooseInstance(id: number): void {
    this.router.navigate(['datasets/' + this.chosenDataset.id + '/instances', id]);
  }

  public showAllAnnotations(annotations: Annotation[], instanceId: number): void {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', {annotations: annotations, instanceId: instanceId});
    this.dialog.open(DisagreeingAnnotationsDialogComponent, dialogConfig);
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

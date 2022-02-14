import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DataSet } from '../model/data-set/data-set.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { AnnotationStatus, ProjectState } from '../model/enums/enums.model';
import { Instance } from '../model/instance/instance.model';
import { Annotation } from '../model/annotation/annotation.model';
import { ActivatedRoute, Params } from '@angular/router';
import { SessionStorageService } from 'src/app/session-storage.service';
import { MatTableDataSource } from '@angular/material/table';
import { AddProjectDialogComponent } from '../dialogs/add-project-dialog/add-project-dialog.component';
import { DialogConfigService } from '../dialogs/dialog-config.service';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationConsistencyDialogComponent } from '../dialogs/annotation-consistency-dialog/annotation-consistency-dialog.component';
import { UpdateProjectDialogComponent } from '../dialogs/update-project-dialog/update-project-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { DisagreeingAnnotationsDialogComponent } from '../dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component';
import { DataSetProjectService } from '../services/data-set-project.service';
import { DataSetService } from '../services/data-set.service';
import { Location } from '@angular/common';
import { AnnotationNotificationService } from '../services/annotation-notification.service';


@Component({
  selector: 'de-data-set-detail',
  templateUrl: './data-set-detail.component.html',
  styleUrls: ['./data-set-detail.component.css']
})

export class DataSetDetailComponent implements OnInit {

  public chosenDataset: DataSet = new DataSet();
  public dataSourceProjects: MatTableDataSource<DataSetProject> = new MatTableDataSource<DataSetProject>(this.chosenDataset.projects);
  public displayedColumnsProjects: string[] = ['name', 'url', 'numOfInstances', 'fullyAnnotated', 'consistency', 'projectUpdate', 'projectDelete', 'status'];
  public chosenProject: DataSetProject = new DataSetProject();
  public projectState = ProjectState;
  public instancesFilters = ["All instances", "Need additional annotations", "With disagreeing annotations"]; // ovde staviti kao Object.keys(...); pogledaj dva reda ispod
  public filterFormControl: FormControl = new FormControl('All instances', [Validators.required]);
  private pollingCycleDurationInSeconds: number = 10;
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
  public chosenInstance: Instance = new Instance(this.sessionService);
  public automaticAnnotationMode = false;
  public panelOpenState = false;

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
      this.paginator = mp;
      this.dataSourceProjects.paginator = this.paginator;
  }

  //// todo delete unnecessary
  public totalNumInstances: number = 0;
  ///

  constructor(private route: ActivatedRoute, private sessionService: SessionStorageService, 
    private projectService: DataSetProjectService, private datasetService: DataSetService, 
    private dialog: MatDialog, private toastr: ToastrService, private location: Location, 
    private annotationNotificationService: AnnotationNotificationService) {
      this.annotationNotificationService.newAnnotation.subscribe(annotation => {
        this.annotationSubmitted(annotation);
      });
      this.annotationNotificationService.changedAnnotation.subscribe(annotation => {
        this.annotationSubmitted(annotation);
      });
  }

  public ngOnInit() {
    this.sessionService.clearAutoAnnotationMode();
    this.sessionService.clearSmellFilter();
    this.route.params.subscribe(async (params: Params) => {
      this.loadProjects(params);
    });
  }

  private async loadProjects(params: Params) {
    this.chosenDataset = new DataSet(await this.datasetService.getDataSet(params['id']));
    this.countAnnotatedInstances();//todo
    this.dataSourceProjects.data = this.chosenDataset.projects;
    this.loadInstance(params);
  }

  private annotationSubmitted(annotation: Annotation) {
    this.updateInstancesTable(annotation);
    if (this.sessionService.getAutoAnnotationMode() == 'true') this.loadNextInstance();
  }

  private updateInstancesTable(annotation: Annotation) {
    this.sessionService.setSmellFilter(annotation.instanceSmell.name);
    var annotatedInstance = this.filterInstancesBySmell().find(i => i.id == this.chosenInstance.id);
    if (!annotatedInstance) return;
    annotatedInstance.annotationFromLoggedUser = annotation;
    annotatedInstance.hasAnnotationFromLoggedUser = true;
  }

  public loadNextInstance() {
    var projectInstances = this.getProjectInstances(this.chosenProject);
    var currentInstanceIndex = projectInstances.findIndex(i => i.id == this.chosenInstance.id);
    if (currentInstanceIndex == projectInstances.length-1) this.loadNextProjectInstance();
    else this.chooseInstance(projectInstances[currentInstanceIndex+1]);
  }

  public loadPreviousInstance() {
    var projectInstances = this.getProjectInstances(this.chosenProject);
    var currentInstanceIndex = projectInstances.findIndex(i => i.id == this.chosenInstance.id);
    if (currentInstanceIndex == 0) this.loadPreviousProjectInstance();
    else this.chooseInstance(projectInstances[currentInstanceIndex-1]);
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
      this.chooseProject(nextProject).then(() => {
        var projectInstances = this.getProjectInstances(this.chosenProject);
        if (projectInstances.length > 0) {
          this.chosenInstance = projectInstances[0];
          this.location.replaceState('/datasets/'+this.chosenDataset.id+'/instances/'+this.chosenInstance.id);
        }
      })
    }
  }

  private loadPreviousProjectInstance() {
    var previousProject = this.getPreviousProject();
    if (previousProject) { 
      this.chooseProject(previousProject).then(() => {
        var projectInstances = this.getProjectInstances(this.chosenProject);
        if (projectInstances.length > 0) {
          this.chosenInstance = projectInstances[projectInstances.length-1];
          this.location.replaceState('/datasets/'+this.chosenDataset.id+'/instances/'+this.chosenInstance.id);
        }
      })
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

  //todo
  private countAnnotatedInstances() {
    var counter = 0;
    this.chosenDataset.projects.forEach(project => {
      counter += project.countAnnotatedInstances();
    });
    this.annotatedInstancesNum = counter;
  }

  private loadInstance(params: Params) {
    if (params['instanceId']) {
      this.initProject();
      this.chooseInstance(this.filterInstancesBySmell().find(i => i.id == params['instanceId'])!);
    }
  }

  private initProject() {
    this.chosenProject = this.chosenDataset.projects[0];
    this.initSmellSelection();
    this.initInstances();
    this.initSeverities();
  }

  public addProject(): void {
    let dialogConfig = DialogConfigService.setDialogConfig('480px', '520px', this.chosenDataset.id);// auto
    let dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(async (dataset: DataSet) => {
      if (dataset) {
        this.chosenDataset.projects = dataset.projects.map(p => new DataSetProject(p));
        this.chosenDataset.projectsCount = this.chosenDataset.projects.length;
        this.dataSourceProjects.data = this.chosenDataset.projects;
        this.startPollingProjects();
      }
    });
  }

  private startPollingProjects(): void {
    let secondsToWait: number = 0;
    for (let project of this.chosenDataset.projects.filter(p => p.state == ProjectState.Processing)) {
      this.pollDataSetProjectAsync(project, secondsToWait++);
    }
  }

  private async pollDataSetProjectAsync(dataSetProject: DataSetProject, secondsToWait: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000 * secondsToWait));
    while (dataSetProject.state == ProjectState.Processing) {
      await new Promise(resolve => setTimeout(resolve, 1000 * this.pollingCycleDurationInSeconds));
      dataSetProject = new DataSetProject(await this.projectService.getProject(dataSetProject.id));
    }
    this.updateProjects(dataSetProject);
  }

  private updateProjects(dataSetProject: DataSetProject): void {
    let i = this.chosenDataset.projects.findIndex(p => p.id == dataSetProject.id);
    this.chosenDataset.projects[i] = dataSetProject;
    this.dataSourceProjects.data = this.chosenDataset.projects;
  }

  public updateProject(project: DataSetProject): void {
    let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px', project);//auto
    let dialogRef = this.dialog.open(UpdateProjectDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((updated: DataSetProject) => {
      if (updated) this.toastr.success('Updated project ' + updated.name);
    });
  }

  public deleteProject(id: number): void {
    let dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.projectService.deleteDataSetProject(id).subscribe(deleted => {
        this.chosenDataset.projects.splice(this.chosenDataset.projects.findIndex(p => p.id == deleted.id), 1);
        this.dataSourceProjects.data = this.chosenDataset.projects;
      });
    });
  }

  public async chooseProject(project: DataSetProject): Promise<DataSetProject> {
    this.chosenProject = new DataSetProject(await this.projectService.getProject(project.id));
    this.chosenInstance = new Instance(this.sessionService);
    this.location.replaceState('/datasets/' + this.chosenDataset.id);
    this.initSmellSelection();
    this.initInstances();
    this.initSeverities();
    return this.chosenProject;
  }

  private initSmellSelection() {
    this.codeSmells = [];
    this.chosenProject.candidateInstances.forEach(candidate => this.codeSmells.push(candidate.codeSmell?.name!));
    if (!this.sessionService.getSmellFilter()) this.sessionService.setSmellFilter(this.codeSmells[0]);  
    else this.selectedSmellFormControl.setValue(this.sessionService.getSmellFilter());
    this.selectedSmellFormControl.setValue(this.sessionService.getSmellFilter());
  }

  private initInstances() {
    this.searchInput = '';
    this.chosenProject.candidateInstances.forEach(candidate => {
      candidate.instances.forEach((instance, index) => candidate.instances[index] = new Instance(this.sessionService, instance));
    });

    this.dataSourceInstances.data = [];
    this.dataSourceInstances.data = this.filterInstancesBySmell();
  }

  private filterInstancesBySmell(): Instance[] {
    return this.chosenProject.candidateInstances.find(c => c.codeSmell?.name == this.sessionService.getSmellFilter())?.instances!;
  }

  private initSeverities() {
    this.severityValues.clear();
    this.severityValues.add(null);
    this.filterInstancesBySmell().forEach((i:any) => {
      if (i.annotationFromLoggedUser?.severity != null) this.severityValues.add(i.annotationFromLoggedUser?.severity);
    });
  }

  public searchProjects(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSourceProjects.data = this.chosenDataset.projects.filter(p => p.name.toLowerCase().includes(input.toLowerCase()));
  }

  public checkConsistency(projectId: number): void {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', '600px', projectId); // auto
    this.dialog.open(AnnotationConsistencyDialogComponent, dialogConfig);
  }

  // todo
  public filterSelection() {    
    // if (this.filterFormControl.value == 'All instances') {
    //   this.showAllInstances();
    // } else if (this.filterFormControl.value == 'Need additional annotations') {
    //   this.showInstancesForAdditionalAnnotation();
    // } else {
    //   this.showInstancesWithDisagreeingAnnotations();
    // }
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
    this.sessionService.setSmellFilter(this.selectedSmellFormControl.value);
    this.dataSourceInstances.data = this.filterInstancesBySmell();
    this.initSeverities();
    this.selectedAnnotationStatus = AnnotationStatus.All;
    this.chosenInstance = new Instance(this.sessionService);
  }

  public chooseInstance(instance: Instance): void {
    this.chosenInstance = instance;
    this.location.replaceState('/datasets/'+this.chosenDataset.id+'/instances/'+this.chosenInstance.id);
    this.route.params.subscribe(async (params: Params) => {
      this.loadProjects(params);
    });
  }

  public showAllAnnotations(annotations: Annotation[], instanceId: number): void {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', {annotations: annotations, instanceId: instanceId});
    this.dialog.open(DisagreeingAnnotationsDialogComponent, dialogConfig);
  }

  public toggleAutomaticMode() {
    this.sessionService.setAutoAnnotationMode(this.automaticAnnotationMode);
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

  ////
  /*
  private countAnnotatedInstances() {
    this.annotatedInstancesNum = 0;
    this.totalNumInstances = 0;
    this.chosenDataset.projects.forEach(project => {
      //popraviti,puca
      // project.candidateInstances.forEach(candidates => {
      //   this.totalNumInstances += candidates.instances.length;
      //   candidates.instances.forEach(instance => {
      //     if (instance.annotations.find(a => a.annotator.id.toString() == this.sessionService.getLoggedInAnnotator())) {
      //       this.annotatedInstancesNum++;
      //     }
      //   });
      // });
    });
  }
}*/
}

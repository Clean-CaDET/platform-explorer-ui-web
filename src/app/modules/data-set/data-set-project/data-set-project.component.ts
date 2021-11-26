import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { AnnotationConsistencyDialogComponent } from '../dialogs/annotation-consistency-dialog/annotation-consistency-dialog.component';

import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { InstanceFilter, ProjectState } from '../model/enums/enums.model';

import { DataSetService } from '../data-set.service';
import { AnnotationService } from '../annotation/annotation.service';
import { DialogConfigService } from '../dialogs/dialog-config.service';
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';
import { AddProjectDialogComponent } from '../dialogs/add-project-dialog/add-project-dialog.component';
import { DataSet } from '../model/data-set/data-set.model';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { UpdateProjectDialogComponent } from '../dialogs/update-project-dialog/update-project-dialog.component';


@Component({
  selector: 'de-data-set-project',
  templateUrl: './data-set-project.component.html',
  styleUrls: ['./data-set-project.component.css']
})
export class DataSetProjectComponent implements OnInit {

  @Input() public projects: DataSetProject[] = [];
  @Input() public dataset: DataSet | null = null;
  public candidateInstances: SmellCandidateInstances[] = [];
  public displayedColumns: string[] = ['name', 'url', 'numOfInstances', 'status', 'consistency', 'projectDelete', 'projectUpdate'];
  public dataSource: MatTableDataSource<DataSetProject> = new MatTableDataSource<DataSetProject>(this.projects);
  public filter: InstanceFilter | null = null;
  public projectState = ProjectState;
  public chosenProject: DataSetProject = new DataSetProject();
  @Output() newProjects = new EventEmitter<DataSetProject[]>();
  @Output() newFilter = new EventEmitter<InstanceFilter>();
  @Output() newCandidates = new EventEmitter<SmellCandidateInstances[]>();
  public instancesFilters = ["All instances", "Need additional annotations", "With disagreeing annotations"];
  public filterFormControl: FormControl = new FormControl('', [Validators.required]);
  public selectedFilter: string = '';

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  private pollingCycleDurationInSeconds: number = 10;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dataSetService: DataSetService, private annotationService: AnnotationService, private dialog: MatDialog, private httpClient: HttpClient) { }

  public ngOnInit(): void {
    this.filterFormControl.markAsTouched();
    this.httpClient.get('assets/appsettings.json').subscribe((data: any) => this.pollingCycleDurationInSeconds = data.pollingCycleDuration);
  }

  public ngOnChanges(): void {
    this.chosenProject = new DataSetProject();
    this.candidateInstances = [];
    this.newCandidates.emit(this.candidateInstances);
    if (!this.isProjectsEmpty()) {
      this.projects.forEach((project, index) => this.projects[index] = new DataSetProject(project));
      this.startPollingProjects();
    } 
    this.dataSource.data = this.projects;
  }

  public isProjectsEmpty(): boolean {
    return this.projects.length == 0;
  }

  public showAllInstances(): void {
    this.resetCandidateInstances();
    this.filter = InstanceFilter.All;
    this.newFilter.emit(this.filter);
    this.showFilteredInstances();
  }

  private resetCandidateInstances() {
    this.candidateInstances = [];
    this.newCandidates.emit(this.candidateInstances);
  }

  public async showInstancesForAdditionalAnnotation(): Promise<any> {
    this.resetCandidateInstances();
    this.filter = InstanceFilter.NeedAdditionalAnnotations;
    this.newFilter.emit(this.filter);
    this.candidateInstances = await this.annotationService.requiringAdditionalAnnotation(this.chosenProject);
    this.newCandidates.emit(this.candidateInstances);
  }

  public async showInstancesWithDisagreeingAnnotations():  Promise<any> {
    this.resetCandidateInstances();
    this.filter = InstanceFilter.DisagreeingAnnotations;
    this.newFilter.emit(this.filter);
    this.candidateInstances = await this.annotationService.disagreeingAnnotations(this.chosenProject);
    this.newCandidates.emit(this.candidateInstances);
  }

  public searchProjects(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.projects.filter(p => p.name.toLowerCase().includes(input.toLowerCase()));
  }

  public checkConsistency(projectId: number): void {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', '600px', projectId);
    this.dialog.open(AnnotationConsistencyDialogComponent, dialogConfig);
  }

  private showFilteredInstances(): void {
    switch(this.filter) { 
      case InstanceFilter.All: {
        this.candidateInstances.push.apply(this.candidateInstances, this.chosenProject.candidateInstances);
        this.newCandidates.emit(this.candidateInstances);
        break; 
      }
      case InstanceFilter.NeedAdditionalAnnotations: { 
        this.showInstancesForAdditionalAnnotation();
        break; 
      } 
      case InstanceFilter.DisagreeingAnnotations: { 
        this.showInstancesWithDisagreeingAnnotations();
        break; 
      } 
    }
  }

  private startPollingProjects(): void {
    let secondsToWait: number = 0;
    for (let project of this.projects.filter(p => p.state == ProjectState.Processing)) {
      this.pollDataSetProjectAsync(project, secondsToWait++);
    }
  }

  private async pollDataSetProjectAsync(dataSetProject: DataSetProject, secondsToWait: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000 * secondsToWait));
    while (dataSetProject.state == ProjectState.Processing) {
      await new Promise(resolve => setTimeout(resolve, 1000 * this.pollingCycleDurationInSeconds));
      dataSetProject = new DataSetProject(await this.dataSetService.pollDataSetProject(dataSetProject.id));
    }
    this.updateProjects(dataSetProject);
  }

  private updateProjects(dataSetProject: DataSetProject): void {
    let i = this.projects.findIndex(p => p.id == dataSetProject.id);
    this.projects[i] = dataSetProject;
    this.dataSource.data = this.projects;
  }

  public chooseProject(project: DataSetProject): void {
    this.chosenProject = project;
    this.selectedFilter = '';
    this.resetCandidateInstances();
  }

  public addProject(): void {
    let dialogConfig = DialogConfigService.setDialogConfig('480px', '520px', this.dataset?.id);
    let dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet) => this.newProjects.emit(res.projects));
  }

  public filterSelection() {
    if (this.selectedFilter == 'All instances') {
      this.showAllInstances();
    } else if (this.selectedFilter == 'Need additional annotations') {
      this.showInstancesForAdditionalAnnotation();
    } else {
      this.showInstancesWithDisagreeingAnnotations();
    }
  }

  public deleteProject(project: DataSetProject): void {
    let dialogConfig = DialogConfigService.setDialogConfig('150px', '300px');
    let dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.dataSetService.deleteDataSetProject(project.id).subscribe(deleted => {
        window.location.reload();
        console.log('Deleted project ', deleted.name); // TODO toastr notification
      });
    });
  }

  public updateProject(project: DataSetProject): void {
    let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px', project);
    let dialogRef = this.dialog.open(UpdateProjectDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((updated: DataSetProject) => {
      if (updated) console.log('Updated project ', updated.name); // TODO toastr notification
    });
  }
}

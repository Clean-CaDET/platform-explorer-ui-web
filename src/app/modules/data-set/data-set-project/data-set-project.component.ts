import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { AnnotationConsistencyDialogComponent } from '../dialogs/annotation-consistency-dialog/annotation-consistency-dialog.component';

import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model';
import { InstanceFilter, ProjectState } from '../model/enums/enums.model';

import { DataSetService } from '../data-set.service';
import { AnnotationService } from '../annotation/annotation.service';
import { UtilService } from 'src/app/util/util.service';

@Component({
  selector: 'de-data-set-project',
  templateUrl: './data-set-project.component.html',
  styleUrls: ['./data-set-project.component.css']
})
export class DataSetProjectComponent implements OnInit {

  @Input() public projects: DataSetProject[] = [];
  public instancesToShow: DataSetInstance[] = [];
  public displayedColumns: string[] = ['select', 'name', 'url', 'numOfInstances', 'status', 'consistency'];
  public selection: SelectionModel<DataSetProject> = new SelectionModel<DataSetProject>(true, []);
  public dataSource: MatTableDataSource<DataSetProject> = new MatTableDataSource<DataSetProject>(this.projects);
  public filter: InstanceFilter = InstanceFilter.All;
  public projectState = ProjectState;

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  private pollingCycleDurationInSeconds: number = 10;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dataSetService: DataSetService, private annotationService: AnnotationService, private dialog: MatDialog, private httpClient: HttpClient) { }

  public ngOnInit(): void {
    this.httpClient.get('assets/appsettings.json').subscribe((data: any) => this.pollingCycleDurationInSeconds = data.pollingCycleDuration);
  }

  public ngOnChanges(): void {
    this.selection.clear();
    this.instancesToShow = [];
    if (!this.isProjectsEmpty()) {
      this.projects.forEach((project, index) => this.projects[index] = new DataSetProject(project));
      this.dataSource.data = this.projects;
      this.startPollingProjects();
    }
  }

  public toggleProjectSelection(selectedProject: DataSetProject): void {
    this.selection.toggle(selectedProject);
    this.showFilteredInstances();
  }

  public toggleAllProjectsSelection(): void {
    if (this.isAllProjectsSelected()) {
      this.instancesToShow = [];
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data.filter(p => p.instances.length > 0));
    this.showFilteredInstances();
  }

  public isAllProjectsSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numProjectsWithInstances = this.dataSource.data.filter(p => p.instances.length > 0).length;
    return numSelected === numProjectsWithInstances;
  }

  public isProjectsEmpty(): boolean {
    return this.projects.length == 0;
  }

  public showAllInstances(): void {
    this.filter = InstanceFilter.All;
    this.showFilteredInstances();
  }

  public async showInstancesForAdditionalAnnotation(): Promise<void> {
    this.filter = InstanceFilter.NeedAdditionalAnnotations;
    this.instancesToShow = await this.annotationService.requiringAdditionalAnnotation(this.selection.selected);
  }

  public async showInstancesWithDisagreeingAnnotations(): Promise<void> {
    this.filter = InstanceFilter.DisagreeingAnnotations;
    this.instancesToShow = await this.annotationService.disagreeingAnnotations(this.selection.selected);
  }

  public searchProjects(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.projects.filter(p => UtilService.includesNoCase(p.name, input));
  }

  public async changedInstance(instance: DataSetInstance): Promise<void> {
    this.selection.selected.forEach(project => {
      let i = project.instances.findIndex(i => i.id == instance.id);
      if (i != -1) {
        project.instances[i] = instance;
      }
    });
  }

  public checkConsistency(projectId: number): void {
    let dialogConfig = UtilService.setDialogConfig('420px', '500px', projectId);
    this.dialog.open(AnnotationConsistencyDialogComponent, dialogConfig);
  }

  private showFilteredInstances(): void {
    this.instancesToShow = [];
    switch(this.filter) { 
      case InstanceFilter.All: {
        for (let project of this.selection.selected) {
          this.instancesToShow.push.apply(this.instancesToShow, project.instances);
        }
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

}

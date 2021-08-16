import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model';

import { DataSetService } from '../data-set.service';
import { AnnotationService } from '../annotation/annotation.service';

@Component({
  selector: 'de-data-set-project',
  templateUrl: './data-set-project.component.html',
  styleUrls: ['./data-set-project.component.css']
})
export class DataSetProjectComponent implements OnInit {

  @Input() public projects: DataSetProject[] = [];
  public instancesToShow: DataSetInstance[] = [];
  public displayedColumns = ['select', 'name', 'url', 'numOfInstances', 'status'];
  public selection = new SelectionModel<DataSetProject>(true, []);
  public dataSource = new MatTableDataSource<DataSetProject>(this.projects);
  public instancesType: InstancesType = InstancesType.All;

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dataSetService: DataSetService, private annotationService: AnnotationService) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.selection.clear();
    this.instancesToShow = [];
    if (!this.isProjectsEmpty()) {
      this.dataSource.data = this.projects;
      this.startPolling();
    }
  }

  public toggleProjectSelection(selectedProject: DataSetProject): void {
    this.selection.toggle(selectedProject);
    this.showProperInstances();
  }

  public toggleAllProjectsSelection(): void {
    if (this.isAllProjectsSelected()) {
      this.instancesToShow = [];
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data.filter(p => p.instances.length > 0));
    this.showProperInstances();
  }

  public isAllProjectsSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numProjects = this.dataSource.data.filter(p => p.instances.length > 0).length;
    return numSelected === numProjects;
  }

  public isProjectsEmpty(): boolean {
    return this.projects.length == 0;
  }

  public showAllInstances(): void {
    this.instancesType = InstancesType.All;
    this.showProperInstances();
  }

  public async showInstancesForAdditionalAnnotation(): Promise<void> {
    this.instancesType = InstancesType.NeedAdditionalAnnotations;
    this.instancesToShow = await this.annotationService.requiringAdditionalAnnotation(this.selection.selected);
  }

  public async showInstancesWithDisagreeingAnnotations(): Promise<void> {
    this.instancesType = InstancesType.DisagreeingAnnotations;
    this.instancesToShow = await this.annotationService.disagreeingAnnotations(this.selection.selected);
  }

  private showProperInstances(): void {
    this.instancesToShow = [];
    switch(this.instancesType) { 
      case InstancesType.All: {
        for (let project of this.selection.selected) {
          this.instancesToShow.push.apply(this.instancesToShow, project.instances);
        }
        break; 
      }
      case InstancesType.NeedAdditionalAnnotations: { 
        this.showInstancesForAdditionalAnnotation();
        break; 
      } 
      case InstancesType.DisagreeingAnnotations: { 
        this.showInstancesWithDisagreeingAnnotations();
        break; 
      } 
   }
   
  }

  private startPolling(): void {
    for (let i in this.projects) {
      this.pollDataSetProjectAsync(this.projects[i], +i);
    }
  }

  private async pollDataSetProjectAsync(dataSetProject: DataSetProject, secondsToWait: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000*secondsToWait));
    while (dataSetProject.state == 0) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      dataSetProject = await this.dataSetService.pollDataSetProject(dataSetProject.id);
    }
    this.updateProjects(dataSetProject);
  }

  private updateProjects(dataSetProject: DataSetProject): void {
    for (let i in this.projects) {
      if (this.projects[i].id == dataSetProject.id) {
        this.projects[i] = dataSetProject;
        this.dataSource.data = this.projects;
        return;
      }
    }
  }

}

enum InstancesType {
  All = 'All',
  NeedAdditionalAnnotations = 'Need Additional Annotations',
  DisagreeingAnnotations = 'Disagreeing Annotations'
}

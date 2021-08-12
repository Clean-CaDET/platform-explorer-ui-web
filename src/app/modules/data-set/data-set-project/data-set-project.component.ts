import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model';
import { DataSetService } from '../data-set.service';

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

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dataSetService: DataSetService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (!this.isProjectsEmpty()) {
      this.dataSource.data = this.projects;
      this.startPolling();
    }
  }

  public toggleDataSetSelection(selectedProject: DataSetProject) {
    this.instancesToShow = [];
    if (!this.selection.isSelected(selectedProject)) {
      this.selection.clear();
    }
    this.selection.toggle(selectedProject);
    if (this.selection.selected.length == 1) {
      this.instancesToShow = selectedProject.instances;
    }
  }

  public isProjectsEmpty(): boolean {
    return this.projects.length == 0;
  }

  private startPolling() {
    for (let i in this.projects) {
      this.pollDataSetProjectAsync(this.projects[i], +i);
    }
  }

  private async pollDataSetProjectAsync(dataSetProject: DataSetProject, secondsToWait: number) {
    await new Promise(resolve => setTimeout(resolve, 1000*secondsToWait));
    while (dataSetProject.state == 0) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      dataSetProject = await this.dataSetService.pollDataSetProject(dataSetProject.id);
    }
    this.updateProjects(dataSetProject);
  }

  private updateProjects(dataSetProject: DataSetProject) {
    for (let i in this.projects) {
      if (this.projects[i].id == dataSetProject.id) {
        this.projects[i] = dataSetProject;
        this.dataSource.data = this.projects;
        return;
      }
    }
  }

}

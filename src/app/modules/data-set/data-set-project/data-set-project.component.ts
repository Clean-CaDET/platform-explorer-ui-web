import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSetService } from '../data-set.service';

@Component({
  selector: 'de-data-set-project',
  templateUrl: './data-set-project.component.html',
  styleUrls: ['./data-set-project.component.css']
})
export class DataSetProjectComponent implements OnInit {

  @Input() public projects: DataSetProject[] = [];
  public displayedColumns = ['name', 'url', 'numOfInstances', 'status'];
  public dataSource = new MatTableDataSource<DataSetProject>(this.projects);

  constructor(private dataSetService: DataSetService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (!this.isProjectsEmpty()) {
      this.dataSource = new MatTableDataSource<DataSetProject>(this.projects);
      this.startPolling();
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
        this.dataSource = new MatTableDataSource(this.projects);
        return;
      }
    }
  }

}

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from "@angular/cdk/collections";

import { DataSet } from './model/data-set/data-set.model';
import { DataSetProject } from './model/data-set-project/data-set-project.model';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';
import { AddProjectDialogComponent } from './dialogs/add-project-dialog/add-project-dialog.component';

import { DataSetService } from './data-set.service';

@Component({
  selector: 'de-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.css']
})

export class DataSetComponent implements OnInit {

  private dataSets: DataSet[] = [];
  public projectsToShow: DataSetProject[] = [];
  public displayedColumns = ['select', 'name', 'numOfProjects'];
  public selection = new SelectionModel<DataSet>(true, []);
  public dataSource = new MatTableDataSource<DataSet>(this.dataSets);

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog, private dataSetService: DataSetService) {}

  async ngOnInit() {
    this.dataSets = await this.dataSetService.getAllDataSets();
    this.dataSource.data = this.dataSets;
  }

  public toggleDataSetSelection(selectedDataSet: DataSet) {
    this.projectsToShow = [];
    if (!this.selection.isSelected(selectedDataSet)) {
      this.selection.clear();
    }
    this.selection.toggle(selectedDataSet);
    if (this.selection.selected.length == 1) {
      this.projectsToShow = selectedDataSet.projects;
    }
  }

  public addDataSet(){
    let dialogConfig = this.setDialogConfig('250px', '250px');
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet) => this.addEmptyDataSet(res));
  }

  public addProjectsToDataSet() {
    let selectedDataSet = this.selection.selected[0];
    if (selectedDataSet) {
      let dialogConfig = this.setDialogConfig('480px', '520px', selectedDataSet.id);
      let dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((res: DataSet) => this.showProjects(res));
    }
  }

  private showProjects(dataSet: DataSet) {
    if (dataSet) {
      this.updateDataSets(dataSet);
      this.toggleDataSetSelection(dataSet);
    }
  }

  private updateDataSets(dataSet: DataSet) {
    for (let i in this.dataSets) {
      if (this.dataSets[i].id == dataSet.id) {
        this.dataSets[i] = dataSet;
        this.dataSource.data = this.dataSets;
        return;
      }
    }
  }

  private addEmptyDataSet(dataSet: DataSet) {
    if (dataSet) {
      this.dataSets.push(dataSet);
      this.dataSource.data = this.dataSets;
    }
  }

  private setDialogConfig(height: string, width: string, data?: any) {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = height;
    dialogConfig.width = width;
    dialogConfig.data = data;
    return dialogConfig;
  }

}

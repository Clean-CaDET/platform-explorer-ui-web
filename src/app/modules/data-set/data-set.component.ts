import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from "@angular/cdk/collections";

import { DataSet } from './model/data-set/data-set.model';

import { DataSetService } from './data-set.service'
import { AddProjectDialogComponent } from './dialogs/add-project-dialog/add-project-dialog.component';
import { DataSetProject } from './model/data-set-project/data-set-project.model';

@Component({
  selector: 'de-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.css']
})

export class DataSetComponent implements OnInit {

  private dataSets: DataSet[] = [];
  public projectsToShow: DataSetProject[] = [];
  displayedColumns = ['select', 'name', 'numOfProjects'];
  selection = new SelectionModel<DataSet>(true, []);
  dataSource = new MatTableDataSource<DataSet>(this.dataSets);

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog, private dataSetService: DataSetService) {}

  ngOnInit(): void {
  }

  public selectionChanged(row: DataSet) {
    if (!this.selection.isSelected(row)) {
      this.selection.clear();
    }
    this.selection.toggle(row);
    if (this.selection.selected.length > 0) {
      this.projectsToShow = this.selection.selected[0].projects;
    }
  }

  public addDataSet(){
    let dialogConfig = this.setDialogConfig('250px', '250px');
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet) => this.addEmptyDataSet(res));
  }

  public addProjectToDataSet() {
    let selectedDataSet = this.selection.selected[0];
    if (selectedDataSet) {
      let dialogConfig = this.setDialogConfig('480px', '520px', selectedDataSet.id);
      let dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((res: DataSet) => this.showProjects(res));
    }
  }

  private async showProjects(dataSetWithProjects: DataSet) {
    if (dataSetWithProjects) {
      this.updateDataSets(dataSetWithProjects);
      this.selection.select(dataSetWithProjects);
      this.projectsToShow = dataSetWithProjects.projects;
    }
  }

  private updateDataSets(dataSet: DataSet) {
    for (let i in this.dataSets) {
      if (this.dataSets[i].id == dataSet.id) {
        this.dataSets[i] = dataSet;
        this.dataSource = new MatTableDataSource(this.dataSets);
        return;
      }
    }
  }

  private addEmptyDataSet(dataSet: DataSet) {
    if (dataSet) {
      this.dataSets.push(dataSet);
      this.dataSource = new MatTableDataSource(this.dataSets);
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

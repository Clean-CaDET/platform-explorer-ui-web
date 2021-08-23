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
import { UtilService } from 'src/app/util/util.service';

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

  constructor(private dialog: MatDialog, private dataSetService: DataSetService, private utilService: UtilService) {}

  public async ngOnInit(): Promise<void> {
    this.dataSets = await this.dataSetService.getAllDataSets();
    this.dataSource.data = this.dataSets;
  }

  public toggleDataSetSelection(selectedDataSet: DataSet): void {
    this.projectsToShow = [];
    if (!this.selection.isSelected(selectedDataSet)) {
      this.selection.clear();
    }
    this.selection.toggle(selectedDataSet);
    if (this.selection.selected.length == 1) {
      this.projectsToShow = selectedDataSet.projects;
    }
  }

  public addDataSet(): void {
    let dialogConfig = this.utilService.setDialogConfig('250px', '250px');
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet) => this.addEmptyDataSet(res));
  }

  public addProjectsToDataSet(): void {
    let selectedDataSet = this.selection.selected[0];
    if (selectedDataSet) {
      let dialogConfig = this.utilService.setDialogConfig('480px', '520px', selectedDataSet.id);
      let dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((res: DataSet) => this.showProjects(res));
    }
  }

  public searchDataSets(event: Event): void {
    if (this.selection.selected.length == 1) {
      this.toggleDataSetSelection(this.selection.selected[0]);
    }
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.dataSets.filter(s => s.name.includes(input));
  }

  private showProjects(dataSet: DataSet): void {
    if (dataSet) {
      this.updateDataSets(dataSet);
      this.toggleDataSetSelection(dataSet);
    }
  }

  private updateDataSets(dataSet: DataSet): void {
    for (let i in this.dataSets) {
      if (this.dataSets[i].id == dataSet.id) {
        this.dataSets[i] = dataSet;
        this.dataSource.data = this.dataSets;
        return;
      }
    }
  }

  private addEmptyDataSet(dataSet: DataSet): void {
    if (dataSet) {
      this.dataSets.push(dataSet);
      this.dataSource.data = this.dataSets;
    }
  }

}

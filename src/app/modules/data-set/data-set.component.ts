import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from "@angular/cdk/collections";

import { DataSet } from './model/data-set/data-set.model';
import { DataSetProject } from './model/data-set-project/data-set-project.model';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';
import { AddProjectDialogComponent } from './dialogs/add-project-dialog/add-project-dialog.component';

import { DataSetService } from './data-set.service';
import { DialogConfigService } from './dialogs/dialog-config.service';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { UpdateDataSetDialogComponent } from './dialogs/update-data-set-dialog/update-data-set-dialog.component';

@Component({
  selector: 'de-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.css']
})

export class DataSetComponent implements OnInit {

  private dataSets: DataSet[] = [];
  public projectsToShow: DataSetProject[] = [];
  public displayedColumns = ['select', 'name', 'numOfProjects', 'dataSetDelete', 'dataSetUpdate'];
  public selection = new SelectionModel<DataSet>(true, []);
  public dataSource = new MatTableDataSource<DataSet>(this.dataSets);

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog, private dataSetService: DataSetService) {}

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
    let dialogConfig = DialogConfigService.setDialogConfig('300px', '300px');
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet) => this.addEmptyDataSet(res));
  }

  public addProjectToDataSet(): void {
    let selectedDataSet = this.selection.selected[0];
    if (selectedDataSet) {
      let dialogConfig = DialogConfigService.setDialogConfig('480px', '520px', selectedDataSet.id);
      let dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((res: DataSet) => this.showProjects(res));
    }
  }

  public searchDataSets(event: Event): void {
    if (this.selection.selected.length == 1) {
      this.toggleDataSetSelection(this.selection.selected[0]);
    }
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.dataSets.filter(s => s.name.toLowerCase().includes(input.toLowerCase()));
  }

  private showProjects(dataSet: DataSet): void {
    if (dataSet) {
      this.updateDataSets(dataSet);
      this.toggleDataSetSelection(dataSet);
    }
  }

  private updateDataSets(dataSet: DataSet): void {
    let i = this.dataSets.findIndex(s => s.id == dataSet.id);
    this.dataSets[i] = dataSet;
    this.dataSource.data = this.dataSets;
  }

  private addEmptyDataSet(dataSet: DataSet): void {
    if (dataSet) {
      this.dataSets.push(dataSet);
      this.dataSource.data = this.dataSets;
    }
  }

  public deleteDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('150px', '300px');
    let dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.dataSetService.deleteDataSet(dataSet.id).subscribe(deleted => {
        window.location.reload();
        console.log('Deleted dataset ', deleted.name); // TODO toastr notification
      });
    });
  }

  public updateDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px', dataSet);
    let dialogRef = this.dialog.open(UpdateDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((updated: DataSet) => {
      console.log('Updated dataset ', updated.name); // TODO toastr notification
    });
  }
}

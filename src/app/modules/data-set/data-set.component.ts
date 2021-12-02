import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataSet } from './model/data-set/data-set.model';
import { DataSetProject } from './model/data-set-project/data-set-project.model';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';

import { DataSetService } from './data-set.service';
import { ExportDraftDataSetDialogComponent } from './dialogs/export-draft-data-set-dialog/export-draft-data-set-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { DialogConfigService } from './dialogs/dialog-config.service';
import { SmellCandidateInstances } from './model/smell-candidate-instances/smell-candidate-instances.model';
import { InstanceFilter } from './model/enums/enums.model';
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
  public displayedColumns = ['name', 'numOfProjects', 'dataSetExport', 'dataSetUpdate', 'dataSetDelete'];
  public dataSource = new MatTableDataSource<DataSet>(this.dataSets);
  public chosenDataset: DataSet = new DataSet();
  public filter: InstanceFilter = InstanceFilter.All;
  public candidateInstances: SmellCandidateInstances[] = [];
  public panelOpenState = false;

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog, private dataSetService: DataSetService, private toastr: ToastrService) {}

  public async ngOnInit(): Promise<void> {
    this.dataSets = await this.dataSetService.getAllDataSets();
    this.dataSource.data = this.dataSets;
  }

  public addDataSet(): void {
    let dialogConfig = DialogConfigService.setDialogConfig('300px', '300px');
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet) => this.addEmptyDataSet(res));
  }

  public searchDataSets(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.dataSets.filter(s => s.name.toLowerCase().includes(input.toLowerCase()));
  }

  public showProjects(dataSet: DataSet): void {
    if (dataSet) {
      this.updateDataSets(dataSet);
      this.projectsToShow = dataSet.projects;
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

  public chooseDataset(dataset: DataSet): void {
    this.chosenDataset = dataset;
    this.projectsToShow = dataset.projects;
  }

  public newProjects(projects: DataSetProject[]): void {
    this.projectsToShow = projects;
    this.chosenDataset.projects = projects;
  }

  public newFilter(filter: InstanceFilter): void {
    this.filter = filter;
  }

  public newCandidates(candidates: SmellCandidateInstances[]): void {
    this.candidateInstances = candidates;
  }
  public exportDraftDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px');
    let dialogRef = this.dialog.open(ExportDraftDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((exportPath: string) => {
      if (exportPath == '') return;
      this.dataSetService.exportDraftDataSet(dataSet.id, exportPath).subscribe(res => {
        let result = new Map(Object.entries(res));
        this.toastr.success(result.get('successes')[0]['message']);
      });
    });
  }

  public deleteDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('150px', '300px');
    let dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.dataSetService.deleteDataSet(dataSet.id).subscribe(deleted => {
        this.dataSets.splice(this.dataSets.findIndex(d => d.id == dataSet.id), 1);
        this.dataSource.data = this.dataSets;
        if (this.chosenDataset.id == dataSet.id) this.projectsToShow = [];
      });
    });
  }

  public updateDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px', dataSet);
    let dialogRef = this.dialog.open(UpdateDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((updated: DataSet) => {
      if (updated) this.toastr.success('Updated dataset ' + updated.name);
    });
  }
}

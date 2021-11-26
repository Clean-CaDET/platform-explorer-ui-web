import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataSet } from './model/data-set/data-set.model';
import { DataSetProject } from './model/data-set-project/data-set-project.model';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';

import { DataSetService } from './data-set.service';
import { DialogConfigService } from './dialogs/dialog-config.service';
import { SmellCandidateInstances } from './model/smell-candidate-instances/smell-candidate-instances.model';
import { InstanceFilter } from './model/enums/enums.model';

@Component({
  selector: 'de-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.css']
})

export class DataSetComponent implements OnInit {

  private dataSets: DataSet[] = [];
  public projectsToShow: DataSetProject[] = [];
  public displayedColumns = ['name', 'numOfProjects'];
  public dataSource = new MatTableDataSource<DataSet>(this.dataSets);
  public chosenDataset: DataSet = new DataSet();
  public filter: InstanceFilter = InstanceFilter.All;
  public candidateInstances: SmellCandidateInstances[] = [];

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
  }

  public newFilter(filter: InstanceFilter): void {
    this.filter = filter;
  }

  public newCandidates(candidates: SmellCandidateInstances[]): void {
    this.candidateInstances = candidates;
  }

}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AddDataSetDialogComponent } from '../add-data-set-dialog/add-data-set-dialog.component';

import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

import {ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

import { RequestService } from '../../app/request.service'
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface DataSet {
  id: number;
  url: string;
  instances: any[];
  state: number;
}

@Component({
  selector: 'app-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.css']
})

export class DataSetComponent implements OnInit {

  private dataSets: DataSet[] = [];
  displayedColumns = ['id', 'url', 'loading'];
  dataSource = new MatTableDataSource<DataSet>(this.dataSets);

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog, private requestService: RequestService) {}

  public addDataSets(){
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '450px';
    dialogConfig.width = '500px';
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet[]) => this.addResponseDataSets(res));
  }

  private async addResponseDataSets(sets: DataSet[]) {
    this.dataSets.push.apply(this.dataSets, sets);
    this.dataSource = new MatTableDataSource(this.dataSets);
    this.pollingAllDataSets(sets);
  }

  private pollingAllDataSets(sets: DataSet[]) {
    for (let i in sets) {
      let dataSet = sets[i];
      this.pollingOneDataSet(dataSet, +i);
    }
  }

  private async pollingOneDataSet(dataSet: DataSet, i: number) {
    await new Promise(resolve => setTimeout(resolve, 1000*i));
    while (dataSet.state != 1) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      dataSet = await this.requestService.sendRequestAsync('GET', 'http://localhost:51834/api/dataset/' + dataSet.id);
    }
    this.updateDataSets(dataSet);
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

  ngOnInit(): void {
  }

}

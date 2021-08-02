import { Component, OnInit } from '@angular/core';

import { AddDataSetDialogComponent } from '../add-data-set-dialog/add-data-set-dialog.component';

import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

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

  dataSets: DataSet[] = [];

  constructor(private dialog: MatDialog) {}

  public addDataSet(){
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '450px';
    dialogConfig.width = '500px';
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet[]) => this.addDataSets(res));
  }

  private addDataSets(sets: DataSet[]) {
    for (let set of sets) {
      this.dataSets.push(set);
    }
  }

  ngOnInit(): void {
  }

}

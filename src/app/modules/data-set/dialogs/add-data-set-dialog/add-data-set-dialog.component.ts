import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from "@angular/material/dialog";

import { DataSet } from '../../model/data-set/data-set.model';

import { DataSetService } from '../../data-set.service'; 

@Component({
  selector: 'de-add-data-set-dialog',
  templateUrl: './add-data-set-dialog.component.html',
  styleUrls: ['./add-data-set-dialog.component.css']
})

export class AddDataSetDialogComponent implements OnInit {

  public name: string = '';

  constructor(private dataSetService: DataSetService, private dialogRef: MatDialogRef<AddDataSetDialogComponent>) { }

  ngOnInit(): void {
  }

  public createDataSet(): void {
    if (this.name != '') {
      this.dataSetService.createDataSet(this.name).subscribe((res: DataSet) => this.dialogRef.close(res));
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { MatDialogRef } from "@angular/material/dialog";

import { DataSetService } from '../../data-set.service'; 

@Component({
  selector: 'de-add-data-set-dialog',
  templateUrl: './add-data-set-dialog.component.html',
  styleUrls: ['./add-data-set-dialog.component.css']
})

export class AddDataSetDialogComponent implements OnInit {

  public name: string = '';
  dataSetFormControl = new FormControl('', [
    Validators.required,
  ]);

  constructor(private dataSetService: DataSetService, private dialogRef: MatDialogRef<AddDataSetDialogComponent>) { }

  ngOnInit(): void {
  }

  public createDataSet(){
    if (this.dataSetFormControl.valid) {
      this.dataSetService.createDataSet(this.name).subscribe(res => this.dialogRef.close(res));
    }
  }

}

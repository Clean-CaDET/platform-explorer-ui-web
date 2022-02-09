import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataSet } from '../../model/data-set/data-set.model';
import { DataSetService } from '../../services/data-set.service';

@Component({
  selector: 'de-update-data-set-dialog',
  templateUrl: './update-data-set-dialog.component.html',
  styleUrls: ['./update-data-set-dialog.component.css']
})

export class UpdateDataSetDialogComponent implements OnInit {

  private oldName: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public dataSet: DataSet, private dialogRef: MatDialogRef<UpdateDataSetDialogComponent>, private dataSetService: DataSetService) { }

  ngOnInit(): void {
    this.oldName = this.dataSet.name;
  }

  public updateDataSet(): void {
    if (!this.isValidInput()) return;
    this.dataSetService.updateDataSet(this.dataSet).subscribe((res: DataSet) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.dataSet.name != '';
  }

  public close(): void {
    this.dataSet.name = this.oldName;
    this.dialogRef.close();
  }
}

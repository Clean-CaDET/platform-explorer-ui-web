import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { Severity } from '../../model/severity/severity.model';


@Component({
  selector: 'de-add-severity-dialog',
  templateUrl: './add-severity-dialog.component.html',
  styleUrls: ['./add-severity-dialog.component.css']
})

export class AddSeverityDialogComponent implements OnInit {

  public value: string = '';
  public description: string = '';

  constructor(private dialogRef: MatDialogRef<AddSeverityDialogComponent>) { }

  ngOnInit(): void {
  }

  public createSeverity() {
    if (!this.isValidInput()) return;
    this.dialogRef.close(new Severity({value: this.value, description: this.description}));
  }

  private isValidInput(): boolean {
    return this.value != '' && this.description != '';
  }
}

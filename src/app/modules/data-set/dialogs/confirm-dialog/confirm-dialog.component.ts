import { Component } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'de-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})

export class ConfirmDialogComponent {

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>) { }

  public confirm(): void {
    this.dialogRef.close(true);
  }

}

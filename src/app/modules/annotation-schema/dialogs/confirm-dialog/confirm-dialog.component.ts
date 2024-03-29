import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'de-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})

export class ConfirmDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public message: string,
  private dialogRef: MatDialogRef<ConfirmDialogComponent>) { }

  public confirm(): void {
    this.dialogRef.close(true);
  }

}

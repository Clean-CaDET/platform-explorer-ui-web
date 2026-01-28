import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
    selector: 'de-annotation-note-dialog',
    templateUrl: './annotation-note-dialog.component.html',
    styleUrls: ['./annotation-note-dialog.component.css'],
    standalone: false
})

export class AnnotationNoteDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AnnotationNoteDialogData, 
  private dialogRef: MatDialogRef<AnnotationNoteDialogComponent>) { }
  
  public submitNote(): void {
    this.dialogRef.close(this.data.note);
  }

  public close(): void {
    this.dialogRef.close(null);
  }
}

class AnnotationNoteDialogData {
  note: string;
  disableEdit: boolean;
}

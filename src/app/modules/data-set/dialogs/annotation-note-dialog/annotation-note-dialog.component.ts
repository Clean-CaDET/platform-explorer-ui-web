import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
    selector: 'de-annotation-note-dialog',
    templateUrl: './annotation-note-dialog.component.html',
    styleUrls: ['./annotation-note-dialog.component.css'],
    standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule]

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

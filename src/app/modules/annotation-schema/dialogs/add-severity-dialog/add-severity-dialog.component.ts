import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Severity } from '../../model/severity/severity.model';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
    selector: 'de-add-severity-dialog',
    templateUrl: './add-severity-dialog.component.html',
    styleUrls: ['./add-severity-dialog.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
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

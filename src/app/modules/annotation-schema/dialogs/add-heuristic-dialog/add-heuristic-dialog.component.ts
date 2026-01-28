import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Heuristic } from '../../model/heuristic/heuristic.model';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
    selector: 'de-add-heuristic-dialog',
    templateUrl: './add-heuristic-dialog.component.html',
    styleUrls: ['./add-heuristic-dialog.component.css'],
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

export class AddHeuristicDialogComponent implements OnInit {

  public name: string = '';
  public description: string = '';

  constructor(private dialogRef: MatDialogRef<AddHeuristicDialogComponent>) { }

  ngOnInit(): void {
  }

  public createHeuristic() {
    if (!this.isValidInput()) return;
    this.dialogRef.close(new Heuristic({name: this.name, description: this.description}));
  }

  private isValidInput(): boolean {
    return this.name != '' && this.description != '';
  }
}

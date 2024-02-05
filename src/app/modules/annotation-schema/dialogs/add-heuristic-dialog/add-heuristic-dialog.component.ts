import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { Heuristic } from '../../model/heuristic/heuristic.model';


@Component({
  selector: 'de-add-heuristic-dialog',
  templateUrl: './add-heuristic-dialog.component.html',
  styleUrls: ['./add-heuristic-dialog.component.css']
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

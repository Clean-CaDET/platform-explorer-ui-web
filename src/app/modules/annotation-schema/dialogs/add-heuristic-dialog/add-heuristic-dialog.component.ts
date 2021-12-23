import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { AnnotationSchemaService } from '../../annotation-schema.service';
import { Heuristic } from '../../model/heuristic/heuristic.model';


@Component({
  selector: 'de-add-heuristic-dialog',
  templateUrl: './add-heuristic-dialog.component.html',
  styleUrls: ['./add-heuristic-dialog.component.css']
})

export class AddHeuristicDialogComponent implements OnInit {

  public name: string = '';
  public description: string = '';

  constructor(private dialogRef: MatDialogRef<AddHeuristicDialogComponent>, private annotationSchemaService: AnnotationSchemaService) { }

  ngOnInit(): void {
  }

  public createHeuristic() {
    if (!this.isValidInput()) return;
    
    let heuristic = new Heuristic({name: this.name, description: this.description});
    this.annotationSchemaService.createHeuristic(heuristic)
    .subscribe((res: Heuristic) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.name != '' && this.description != '';
  }
}

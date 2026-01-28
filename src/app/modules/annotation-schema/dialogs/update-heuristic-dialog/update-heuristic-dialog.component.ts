import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CodeSmellDefinition } from "../../model/code-smell-definition/code-smell-definition.model";
import { Heuristic } from "../../model/heuristic/heuristic.model";
import { AnnotationSchemaService } from "../../services/annotation-schema.service";

@Component({
    selector: 'de-update-heuristic-dialog',
    templateUrl: './update-heuristic-dialog.component.html',
    styleUrls: ['./update-heuristic-dialog.component.css'],
    standalone: false
})
export class UpdateHeuristicDialogComponent {
  
  public oldName: string = '';
  public oldDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public smellAndHeuristic: [CodeSmellDefinition, Heuristic], 
  private dialogRef: MatDialogRef<UpdateHeuristicDialogComponent>, 
  public annotationSchemaService: AnnotationSchemaService) {
    this.oldName = this.smellAndHeuristic[1].name;
    this.oldDescription = this.smellAndHeuristic[1].description;
  }

  public update(): void {
    if (!this.isValidInput()) return;
    this.annotationSchemaService.updateHeuristicInCodeSmell(this.smellAndHeuristic[0].id, this.smellAndHeuristic[1])
      .subscribe(() => this.dialogRef.close());
  }

  private isValidInput(): boolean {
    return this.smellAndHeuristic[1]?.name != '' && this.smellAndHeuristic[1]?.description != '';
  }

  public close(): void {
    this.smellAndHeuristic[1].name = this.oldName;
    this.smellAndHeuristic[1].description = this.oldDescription;
    this.dialogRef.close();
  }
}
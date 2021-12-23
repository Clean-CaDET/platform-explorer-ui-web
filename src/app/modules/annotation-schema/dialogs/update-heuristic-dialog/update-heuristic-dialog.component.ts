import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AnnotationSchemaService } from "../../annotation-schema.service";
import { Heuristic } from "../../model/heuristic/heuristic.model";

@Component({
  selector: 'de-update-heuristic-dialog',
  templateUrl: './update-heuristic-dialog.component.html',
  styleUrls: ['./update-heuristic-dialog.component.css']
})
export class UpdateHeuristicDialogComponent {
  
  public oldName: string = '';
  public oldDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public heuristic: Heuristic,  private dialogRef: MatDialogRef<UpdateHeuristicDialogComponent>, 
  public annotationSchemaService: AnnotationSchemaService) {
    this.oldName = heuristic.name;
    this.oldDescription = heuristic.description;
  }

  public update(): void {
    if (!this.isValidInput()) return;
    this.annotationSchemaService.updateHeuristic(this.heuristic?.id, this.heuristic)
    .subscribe((res: Heuristic) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.heuristic?.name != '' && this.heuristic?.description != '';
  }

  public close(): void {
    this.heuristic.name = this.oldName;
    this.heuristic.description = this.oldDescription;
    this.dialogRef.close();
  }
}
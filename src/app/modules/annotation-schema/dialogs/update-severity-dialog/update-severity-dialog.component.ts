import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CodeSmellDefinition } from "../../model/code-smell-definition/code-smell-definition.model";
import { Severity } from "../../model/severity/severity.model";
import { AnnotationSchemaService } from "../../services/annotation-schema.service";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
    selector: 'de-update-severity-dialog',
    templateUrl: './update-severity-dialog.component.html',
    styleUrls: ['./update-severity-dialog.component.css'],
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
export class UpdateSeverityDialogComponent {
  
  public oldValue: string = '';
  public oldDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public smellAndSeverity: [CodeSmellDefinition, Severity], 
  private dialogRef: MatDialogRef<UpdateSeverityDialogComponent>, 
  public annotationSchemaService: AnnotationSchemaService) {
    this.oldValue = this.smellAndSeverity[1].value;
    this.oldDescription = this.smellAndSeverity[1].description;
  }

  public update(): void {
    if (!this.isValidInput()) return;
    this.annotationSchemaService.updateSeverityInCodeSmell(this.smellAndSeverity[0].id, this.smellAndSeverity[1])
      .subscribe(() => this.dialogRef.close());
  }

  private isValidInput(): boolean {
    return this.smellAndSeverity[1]?.value != '' && this.smellAndSeverity[1]?.description != '';
  }

  public close(): void {
    this.smellAndSeverity[1].value = this.oldValue;
    this.smellAndSeverity[1].description = this.oldDescription;
    this.dialogRef.close();
  }
}
import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CodeSmellDefinition } from "../../model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType } from "../../model/enums/enums.model";
import { AnnotationSchemaService } from "../../services/annotation-schema.service";

@Component({
  selector: 'de-update-code-smell-dialog',
  templateUrl: './update-code-smell-dialog.component.html',
  styleUrls: ['./update-code-smell-dialog.component.css']
})
export class UpdateCodeSmellDialogComponent {
  
  public oldName: string = '';
  public oldDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public codeSmellDefinition: CodeSmellDefinition,  private dialogRef: MatDialogRef<UpdateCodeSmellDialogComponent>, 
  public annotationSchemaService: AnnotationSchemaService) {
    this.oldName = codeSmellDefinition.name;
    this.oldDescription = codeSmellDefinition.description;
  }

  public update(): void {
    if (!this.isValidInput()) return;
    this.codeSmellDefinition = numberToSnippetType(this.codeSmellDefinition);
    this.annotationSchemaService.updateCodeSmellDefinition(this.codeSmellDefinition?.id, this.codeSmellDefinition)
    .subscribe((res: CodeSmellDefinition) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.codeSmellDefinition?.name != '' && this.codeSmellDefinition?.description != '';
  }

  public close(): void {
    this.codeSmellDefinition.name = this.oldName;
    this.codeSmellDefinition.description = this.oldDescription;
    this.dialogRef.close();
  }
}
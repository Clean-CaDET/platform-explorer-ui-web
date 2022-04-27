import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CodeSmellDefinitionService } from "../../services/code-smell-definition.service";
import { CodeSmellDefinition } from "../../model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType } from "../../model/enums/enums.model";


@Component({
  selector: 'de-severity-values-dialog',
  templateUrl: './severity-values-dialog.component.html',
  styleUrls: ['./severity-values-dialog.component.css']
})
export class SeverityValuesDialogComponent {
  public severityValues: string[] = [];
  public newSeverityValue: string = '';
  public codeSmellDefinition: CodeSmellDefinition | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CodeSmellDefinition, private dialogRef: MatDialogRef<SeverityValuesDialogComponent>,
    public codeSmellDefinitionService: CodeSmellDefinitionService) {
    this.codeSmellDefinition = data;
  }

  public removeValue(value: string): void {
    this.codeSmellDefinition?.severityValues.splice(this.codeSmellDefinition?.severityValues.findIndex(v => v == value), 1);
  }

  public addSeverityValue(): void {
    if (this.newSeverityValue.trim() == '') return;
    this.codeSmellDefinition?.severityValues.push(this.newSeverityValue);
    this.newSeverityValue = '';
  }

  public save(): void {
    this.codeSmellDefinition = numberToSnippetType(this.codeSmellDefinition!);
    this.codeSmellDefinitionService.updateCodeSmellDefinition(this.codeSmellDefinition?.id!, this.codeSmellDefinition!)
    .subscribe((res: CodeSmellDefinition) => this.dialogRef.close(res));
  }
}
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CodeSmellDefinition } from "../../model/code-smell-definition/code-smell-definition.model";

@Component({
  selector: 'de-severity-range-dialog',
  templateUrl: './severity-range-dialog.component.html',
  styleUrls: ['./severity-range-dialog.component.css']
})
export class SeverityRangeDialogComponent {
  public codeSmellDefinition: CodeSmellDefinition | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CodeSmellDefinition) {
    this.codeSmellDefinition = data;
  }
}
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { CodeSmellDefinitionService } from '../../services/code-smell-definition.service';
import { CodeSmellDefinition } from '../../model/code-smell-definition/code-smell-definition.model';
import { SnippetType } from '../../model/enums/enums.model';


@Component({
  selector: 'de-add-code-smell-dialog',
  templateUrl: './add-code-smell-dialog.component.html',
  styleUrls: ['./add-code-smell-dialog.component.css']
})

export class AddCodeSmellDialogComponent implements OnInit {

  public name: string = '';
  public description: string = '';
  public snippetTypes: SnippetType[] = [SnippetType.Class, SnippetType.Function];
  public chosenSnippetType: SnippetType | null = null;

  constructor(private dialogRef: MatDialogRef<AddCodeSmellDialogComponent>, private codeSmellDefinitionService: CodeSmellDefinitionService) { }

  ngOnInit(): void {
  }

  public createCodeSmellDefinition() {
    if (!this.isValidInput()) return;
    
    let codeSmellDefinition = new CodeSmellDefinition({name: this.name, description: this.description, snippetType: this.chosenSnippetType});
    this.codeSmellDefinitionService.createCodeSmellDefinition(codeSmellDefinition)
    .subscribe((res: CodeSmellDefinition) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.name != '' && this.description != '' && this.chosenSnippetType != null;
  }

}

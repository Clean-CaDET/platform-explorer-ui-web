import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CodeSmellDefinition } from '../../model/code-smell-definition/code-smell-definition.model';
import { SnippetType } from '../../model/enums/enums.model';
import { AnnotationSchemaService } from '../../services/annotation-schema.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


@Component({
    selector: 'de-add-code-smell-dialog',
    templateUrl: './add-code-smell-dialog.component.html',
    styleUrls: ['./add-code-smell-dialog.component.css'],
     standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule
    ]
})

export class AddCodeSmellDialogComponent implements OnInit {

  public name: string = '';
  public description: string = '';
  public snippetTypes: SnippetType[] = [SnippetType.Class, SnippetType.Function];
  public chosenSnippetType: SnippetType | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public existingCodeSmells: CodeSmellDefinition[],
    private dialogRef: MatDialogRef<AddCodeSmellDialogComponent>, 
    private annotationSchemaService: AnnotationSchemaService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  public createCodeSmellDefinition() {
    if (!this.isValidInput()) return;
    if (this.codeSmellNameExists()) {
      this.toastr.error('Name already exists!');
      return;
    }
    
    let codeSmellDefinition = new CodeSmellDefinition({name: this.name, description: this.description, snippetType: this.chosenSnippetType});
    this.annotationSchemaService.createCodeSmellDefinition(codeSmellDefinition)
    .subscribe((res: CodeSmellDefinition) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.name != '' && this.description != '' && this.chosenSnippetType != null;
  }

  private codeSmellNameExists() {
    return this.existingCodeSmells.find(smell => smell.name == this.name);
  }
}

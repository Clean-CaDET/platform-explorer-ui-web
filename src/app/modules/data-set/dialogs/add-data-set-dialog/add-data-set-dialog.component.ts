import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataSet } from '../../model/data-set/data-set.model';
import { CodeSmell } from '../../model/code-smell/code-smell.model';
import { DataSetService } from '../../services/data-set.service';
import { CodeSmellDefinition } from 'src/app/modules/annotation-schema/model/code-smell-definition/code-smell-definition.model';
import { AnnotationSchemaService } from 'src/app/modules/annotation-schema/services/annotation-schema.service';

@Component({
  selector: 'de-add-data-set-dialog',
  templateUrl: './add-data-set-dialog.component.html',
  styleUrls: ['./add-data-set-dialog.component.css']
})

export class AddDataSetDialogComponent implements OnInit {

  public name: string = '';
  public chosenCodeSmells: string[] = [];
  public availableCodeSmells: CodeSmellDefinition[] = [];

  constructor(private dataSetService: DataSetService, private dialogRef: MatDialogRef<AddDataSetDialogComponent>, 
    private annotationSchemaService: AnnotationSchemaService) { }

  ngOnInit(): void {
    this.annotationSchemaService.getAllCodeSmellDefinitions().subscribe(res => this.availableCodeSmells = res);
  }

  public createDataSet(): void {
    if (!this.isValidInput()) return;
    let smells: CodeSmell[] = [];
    this.chosenCodeSmells.forEach(codeSmell => {
      var snippetType = this.availableCodeSmells.find(s => s.name == codeSmell)!.snippetType;
      smells.push(new CodeSmell({'name': codeSmell, 'snippetType': snippetType}));
    });
    this.dataSetService.createDataSet(this.name, smells).subscribe((res: DataSet) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.name != '' && this.chosenCodeSmells.length > 0;
  }
}

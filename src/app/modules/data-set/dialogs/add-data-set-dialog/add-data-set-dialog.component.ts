import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { DataSet } from '../../model/data-set/data-set.model';
import { CodeSmell } from '../../model/code-smell/code-smell.model';
import { DataSetService } from '../../services/data-set.service';
import { AnnotationService } from '../../services/annotation.service';

@Component({
  selector: 'de-add-data-set-dialog',
  templateUrl: './add-data-set-dialog.component.html',
  styleUrls: ['./add-data-set-dialog.component.css']
})

export class AddDataSetDialogComponent implements OnInit {

  public name: string = '';
  public codeSmells: string[] = [];
  public availableCodeSmells: CodeSmell[] = [];

  constructor(private dataSetService: DataSetService, private dialogRef: MatDialogRef<AddDataSetDialogComponent>, 
    private annotationService: AnnotationService) { }

  ngOnInit(): void {
    this.annotationService.getAvailableCodeSmells().subscribe(res => this.initSmells(res));
  }

  public createDataSet(): void {
    if (!this.isValidInput()) return;
    
    let smells: CodeSmell[] = [];
    this.codeSmells.forEach(codeSmell => {
      smells.push(new CodeSmell({'name': codeSmell}));
    });
    this.dataSetService.createDataSet(this.name, smells).subscribe((res: DataSet) => this.dialogRef.close(res));
  }

  private initSmells(input: Map<string, string[]>): void {
    for (let keyValue of Object.entries(input)) {
        for (let smell of keyValue[1]) {
            this.availableCodeSmells.push(smell);
        }
    }
  }

  private isValidInput(): boolean {
    return this.name != '' && this.codeSmells.length > 0;
  }

}

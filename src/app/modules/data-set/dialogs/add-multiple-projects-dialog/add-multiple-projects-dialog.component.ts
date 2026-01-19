import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataSetProject } from '../../model/data-set-project/data-set-project.model';
import { DataSetService } from '../../services/data-set.service';
import { DataSet } from '../../model/data-set/data-set.model';
import { numberToSnippetType } from 'src/app/modules/annotation-schema/model/enums/enums.model';
import { CodeSmell } from '../../model/code-smell/code-smell.model';
import { SmellFilter } from '../../model/smell-filter/smell-filter.model';

@Component({
  selector: 'de-add-multiple-projects-dialog',
  templateUrl: './add-multiple-projects-dialog.component.html',
  styleUrls: ['./add-multiple-projects-dialog.component.css'],
})
export class AddMultipleProjectsDialogComponent implements OnInit {

  public filePath: string;
  public codeSmells: CodeSmell[] = [];
  public smellFilters: SmellFilter[] = [];
  public chosenMetrics: string[][] = [];
  selectedFile: File | null = null;
  

  constructor(
    @Inject(MAT_DIALOG_DATA) private dataSetId: number,
    private dataSetService: DataSetService,
    private dialogRef: MatDialogRef<AddMultipleProjectsDialogComponent>
  ) {}

  ngOnInit(): void {
    if (!this.dataSetId) {
      this.dialogRef.close();
    }
    this.dataSetService.getDataSetCodeSmells(this.dataSetId).subscribe((res) => {
      this.codeSmells = res;
      this.codeSmells.map(smell => numberToSnippetType(smell));
      this.codeSmells.forEach(smell => {
        this.smellFilters.push(new SmellFilter({codeSmell: smell, metricsThresholds: []}))
        this.chosenMetrics.push([]);
      });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];

    if (!file.name.endsWith('.xlsx')) {
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  public addMultipleProjectsToDataSet(): void {
    if (!this.selectedFile) {
      return;
    }

    this.dataSetService.importProjectsToDataSet(this.dataSetId, this.selectedFile, this.smellFilters).subscribe((res: DataSet) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.filePath != '';
  }
}

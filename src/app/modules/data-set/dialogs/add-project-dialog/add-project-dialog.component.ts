import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnnotationService } from '../../annotation/annotation.service';
import { DataSetService } from '../../data-set.service';
import { CodeSmell } from '../../model/code-smell/code-smell.model';
import { DataSetProject } from '../../model/data-set-project/data-set-project.model';
import { MetricThresholds } from '../../model/metric-thresholds/metric-thresholds.model';
import { SmellFilter } from '../../model/smell-filter/smell-filter.model';

@Component({
  selector: 'de-add-project-dialog',
  templateUrl: './add-project-dialog.component.html',
  styleUrls: ['./add-project-dialog.component.css']
})
export class AddProjectDialogComponent implements OnInit {

  public project: DataSetProject = new DataSetProject({name: '', url: ''});
  public codeSmells: Map<string, string[]> = new Map<string, string[]>();
  public availableMetrics: Map<string, string[]> = new Map<string, string[]>();
  public metricsForSmells: Map<string, string[]> = new Map<string, string[]>();
  public chosenMetrics: string[][] = [];
  public smellFilters: SmellFilter[] = [];
  public metricsForSelection: string[] = [];
  public selectedSmell: string = '';
 
  constructor(@Inject(MAT_DIALOG_DATA) private dataSetId: number, private dataSetService: DataSetService, private annotationService: AnnotationService, private dialogRef: MatDialogRef<AddProjectDialogComponent>) { }

  ngOnInit(): void {
    if (!this.dataSetId) {
      this.dialogRef.close();
    }
    this.dataSetService.getDataSetCodeSmells(this.dataSetId).subscribe(res => {
      this.codeSmells = res;
      for (let smell of Object.entries(this.codeSmells)) {
        this.smellFilters.push(new SmellFilter({codeSmell: new CodeSmell({name:smell[0]}), metricsThresholds: []}))
        this.chosenMetrics.push([]);
      }
    });
    this.annotationService.getAvailableMetrics().subscribe(res => this.availableMetrics = res);
  }

  public initMetricsThresholdsForSmell(codeSmell: any) {
    this.selectedSmell = codeSmell.name;
    var snippetType = Object.entries(this.codeSmells).find(s => s[0] == codeSmell.name)?.[1][0];
    this.metricsForSelection = Object.entries(this.availableMetrics).find(m => m[0] == snippetType)?.[1];
    
    var i = this.smellFilters.findIndex(f => f.codeSmell?.name == codeSmell.name);
    if (this.smellFilters[i].metricsThresholds.length == 0) {
      for (let metric of this.metricsForSelection) {
          this.smellFilters[i].metricsThresholds.push(new MetricThresholds({metric: metric, minValue: '', maxValue: ''}));  
      }
    }
  }

  public addProjectToDataSet(): void {
    if (this.isValidInput()) {
      this.dataSetService.addProjectToDataSet(this.project, this.smellFilters, this.dataSetId).subscribe(res => this.dialogRef.close(res));
    }
  }

  private isValidInput(): boolean {
    return this.project.name.trim() != '' && this.project.url.trim() != '';
  }
}

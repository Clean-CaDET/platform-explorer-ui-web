import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnnotationService } from '../../annotation/annotation.service';
import { DataSetService } from '../../data-set.service';
import { DataSetProject } from '../../model/data-set-project/data-set-project.model';
import { MetricThresholds } from '../../model/metric-thresholds/metric-thresholds.model';

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
  public metricThresholds: MetricThresholds[] = [];
 
  constructor(@Inject(MAT_DIALOG_DATA) private dataSetId: number, private dataSetService: DataSetService, private annotationService: AnnotationService, private dialogRef: MatDialogRef<AddProjectDialogComponent>) { }

  ngOnInit(): void {
    if (!this.dataSetId) {
      this.dialogRef.close();
    }
    this.dataSetService.getDataSetCodeSmells(this.dataSetId).subscribe(res => this.codeSmells = res);
    this.annotationService.getAvailableMetrics().subscribe(res => this.availableMetrics = res);
  }

  public metricSelectionChanged(){
    let i = 0;
    for (let metrics of Object.entries(this.chosenMetrics)) {
      let smell = Object.entries(this.codeSmells)[i][0];
      for (let metric of metrics[1]) {
        if (!this.metricThresholdsExist(smell, metric)) {
          this.metricThresholds.push(new MetricThresholds({"codeSmell": smell, "metric": metric, "minValue": '', "maxValue": ''}));
        }
      }
      i++;
    }
    this.removeUnselectedMetrics();
  }

  private removeUnselectedMetrics() {
    let i = 0;
    for (let thresholds of this.metricThresholds) {
      let found = false;
      for (let metrics of this.chosenMetrics) {
        for (let metric of metrics) {
          if (thresholds.metric == metric) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        this.metricThresholds.splice(i,1);
      }
      i++;
    }
  }

  private metricThresholdsExist(smell: string, metric: string): boolean {
    for (let threshold of this.metricThresholds) {
      if (threshold.codeSmell == smell && threshold.metric == metric) {
        return true;
      }
    }
    return false;
  }

  public setThresholdValue(event: any, metric: string, i: number, type: string) {
    let smell = Object.entries(this.codeSmells)[i][0];
    for (let j = 0; j < this.metricThresholds.length; j++) {
      if (this.metricThresholds[j].codeSmell == smell && this.metricThresholds[j].metric == metric) {
        if (type == 'min') {
          this.metricThresholds[j].minValue = event.target.value;
        } else {
          this.metricThresholds[j].maxValue = event.target.value;
        }
      }
    }
  }

  public setMetricsThresholds() {
    for (let codeSmell of Object.entries(this.codeSmells)) {
      for (let metrics of Object.entries(this.availableMetrics)) {
        if (codeSmell[1][0] == metrics[0]) {
          this.metricsForSmells.set(codeSmell[0], metrics[1]);
        }
      }
    }
  }

  public addProjectToDataSet(): void {
    this.project.metricsThresholds = this.metricThresholds;
    if (this.isValidInput()) {
      this.dataSetService.addProjectToDataSet(this.project, this.dataSetId).subscribe(res => this.dialogRef.close(res));
    }
  }

  private isValidInput(): boolean {
    if (this.project.name.trim() == '' || this.project.url.trim() == '') return false;
    return true;
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UtilService } from 'src/app/util/util.service';
import { AnnotationService } from '../../annotation/annotation.service';

@Component({
  selector: 'de-annotation-consistency-dialog',
  templateUrl: './annotation-consistency-dialog.component.html',
  styleUrls: ['./annotation-consistency-dialog.component.css']
})
export class AnnotationConsistencyDialogComponent implements OnInit {

  public consistencyTypes: string[] = Object.values(ConsistencyType);
  public selectedConsistencyType: string = '';
  public annotatorNeeded: boolean = false;
  public severityNeeded: boolean = false;
  public severityFormControl = new FormControl('0', [
    Validators.required,
    Validators.min(0),
    Validators.max(3),
  ]);

  public results: Map<string, any> = new Map();
  public selectedResult: string = '';
  public resultDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) private projectId: number, private annotationService: AnnotationService) { }

  public ngOnInit(): void {
  }

  public consistencyTypeChanged(): void {
    this.annotatorNeeded = false;
    this.severityNeeded = false;
    if (this.selectedConsistencyType == ConsistencyType.ConsistencyForAnnotator || this.selectedConsistencyType == ConsistencyType.MetricsSignificanceForAnnotator) {
      this.annotatorNeeded = true;
    } else {
      this.severityNeeded = true;
    }
  }

  public getConsistencyResults(): void {
    if (!this.isValidInput()) {
      return;
    }
    this.getProperConsistencyResults();
  }

  public showResult(resultDescription: string): void {
    this.resultDescription = resultDescription;
    this.selectedResult = this.getMessage(this.results.get(resultDescription)).trim();
  }

  private getMessage(map: Map<string, string | Map<string, string>>): string {
    let messages: string[] = [];
    for (let keyValue of Object.entries(map)) {
      if (typeof keyValue[1] == 'object') {
        messages.push('\n\n' + keyValue[0] + ':' + this.getMessage(keyValue[1]));
      } else {
        messages.push('\n' + keyValue[0] + ':\n  ' + keyValue[1]);
      }
    }
    return messages.join('');
  }

  private getProperConsistencyResults(): void {
    switch(this.selectedConsistencyType) {
      case ConsistencyType.ConsistencyForAnnotator: {
        this.annotationService.getAnnotationConsistencyForAnnotator(this.projectId, UtilService.getAnnotatorId()).subscribe((res: Map<string, string>) => 
          this.results.set('My consistency', res));
        break;
      }
      case ConsistencyType.ConsistencyBetweenAnnotators: {
        let severity = this.severityFormControl.value;
        this.annotationService.getAnnotationConsistencyBetweenAnnotatorsForSeverity(this.projectId, severity).subscribe((res: Map<string, string>) => 
          this.results.set('Consistency for severity ' + severity, res));
        break;
      }
      case ConsistencyType.MetricsSignificanceForAnnotator: {
        this.annotationService.getMetricsSignificanceInAnnotationsForAnnotator(this.projectId, UtilService.getAnnotatorId()).subscribe((res: Map<string, Map<string, string>>) => 
          this.results.set('My metrics significance', res));
        break;
      }
      case ConsistencyType.MetricsSignificanceBetweenAnnotators: {
        let severity = this.severityFormControl.value;
        this.annotationService.getMetricsSignificanceBetweenAnnotatorsForSeverity(this.projectId, severity).subscribe((res: Map<string, Map<string, string>>) => 
          this.results.set('Metrics significance for severity ' + severity, res));
        break;
      }
    }
  }

  private isValidInput(): boolean {
    return this.selectedConsistencyType != ''
      && (this.annotatorNeeded || (this.severityNeeded && this.severityFormControl.valid));
  }

}

enum ConsistencyType {
  ConsistencyForAnnotator = 'Consistency for my annotations',
  ConsistencyBetweenAnnotators = 'Consistency between annotators',
  MetricsSignificanceForAnnotator = 'Metrics significance for my annotations',
  MetricsSignificanceBetweenAnnotators = 'Metrics significance between annotators'
}

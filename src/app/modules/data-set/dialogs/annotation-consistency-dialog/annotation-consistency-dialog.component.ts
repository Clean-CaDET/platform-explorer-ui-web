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

  constructor(@Inject(MAT_DIALOG_DATA) private projectId: number, private annotationService: AnnotationService) { }

  ngOnInit(): void {
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

  private getProperConsistencyResults(): void {
    switch(this.selectedConsistencyType) {
      case ConsistencyType.ConsistencyForAnnotator: {
        this.annotationService.getAnnotationConsistencyForAnnotator(this.projectId, UtilService.getAnnotatorId()).subscribe((res: Map<string, string>) => console.log(res));
        break;
      }
      case ConsistencyType.ConsistencyBetweenAnnotators: {
        this.annotationService.getAnnotationConsistencyBetweenAnnotatorsForSeverity(this.projectId, this.severityFormControl.value).subscribe((res: Map<string, string>) => console.log(res));
        break;
      }
      case ConsistencyType.MetricsSignificanceForAnnotator: {
        this.annotationService.getMetricsSignificanceInAnnotationsForAnnotator(this.projectId, UtilService.getAnnotatorId()).subscribe((res: any) => console.log(res));
        break;
      }
      case ConsistencyType.MetricsSignificanceBetweenAnnotators: {
        this.annotationService.getMetricsSignificanceBetweenAnnotatorsForSeverity(this.projectId, this.severityFormControl.value).subscribe((res: any) => console.log(res));
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

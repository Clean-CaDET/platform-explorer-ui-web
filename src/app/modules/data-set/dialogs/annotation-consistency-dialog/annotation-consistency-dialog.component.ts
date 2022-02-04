import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConsistencyType } from '../../model/enums/enums.model';
import { AnnotationConsistencyService } from '../../annotation-consistency/annotation-consistency.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from 'src/app/session-storage.service';

@Component({
  selector: 'de-annotation-consistency-dialog',
  templateUrl: './annotation-consistency-dialog.component.html',
  styleUrls: ['./annotation-consistency-dialog.component.css']
})
export class AnnotationConsistencyDialogComponent implements OnInit {

  public consistencyTypes: string[] = Object.values(ConsistencyType);
  public selectedConsistencyType: string = '';
  public severityNeeded: boolean = false;
  public severityFormControl: FormControl = new FormControl(null, [
    Validators.required,
    Validators.min(0),
    Validators.max(3),
  ]);
  public typeFormControl: FormControl = new FormControl('', Validators.required);

  public showResultClicked = false;
  public results: Map<string, any> = new Map();
  public selectedResult: string = '';
  public resultDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) private projectId: number, private annotationConsistencyService: AnnotationConsistencyService, private sessionService: SessionStorageService) { }

  public ngOnInit(): void {
    this.typeFormControl.markAsTouched();
  }

  public consistencyTypeChanged(): void {
    if (this.selectedConsistencyType == ConsistencyType.ConsistencyBetweenAnnotators || this.selectedConsistencyType == ConsistencyType.MetricsSignificanceBetweenAnnotators) {
      this.severityNeeded = true;
    } else {
      this.severityNeeded = false;
    }
  }

  public getConsistencyResults(): void {
    if (!this.isValidInput()) {
      return;
    }
    switch(this.selectedConsistencyType) {
      case ConsistencyType.ConsistencyForAnnotator: {
        return this.getAnnotationConsistencyForAnnotator();
      }
      case ConsistencyType.ConsistencyBetweenAnnotators: {
        return this.getAnnotationConsistencyBetweenAnnotatorsForSeverity();
      }
      case ConsistencyType.MetricsSignificanceForAnnotator: {
        return this.getMetricsSignificanceInAnnotationsForAnnotator();
      }
      case ConsistencyType.MetricsSignificanceBetweenAnnotators: {
        return this.getMetricsSignificanceBetweenAnnotatorsForSeverity();
      }
    }
  }

  public showResult(resultDescription: string): void {
    this.showResultClicked = true;
    this.resultDescription = resultDescription;
    let message = this.getMessage(this.results.get(resultDescription)).trim();
    this.selectedResult = message != '' ? message : 'No results!';
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

  private getAnnotationConsistencyForAnnotator(): void {
    this.annotationConsistencyService.getAnnotationConsistencyForAnnotator(this.projectId, Number(this.sessionService.getLoggedInAnnotator())).subscribe((res: Map<string, string>) => 
      this.results.set('Consistency for my annotations', res));
  }

  private getAnnotationConsistencyBetweenAnnotatorsForSeverity(): void {
    let severity = this.severityFormControl.value;
    this.annotationConsistencyService.getAnnotationConsistencyBetweenAnnotatorsForSeverity(this.projectId, severity).subscribe((res: Map<string, string>) => 
      this.results.set('Consistency between annotators for severity ' + severity, res));
  }

  private getMetricsSignificanceInAnnotationsForAnnotator(): void {
    this.annotationConsistencyService.getMetricsSignificanceInAnnotationsForAnnotator(this.projectId, Number(this.sessionService.getLoggedInAnnotator())).subscribe((res: Map<string, Map<string, string>>) => 
      this.results.set('Metrics significance for my annotations', res));
  }

  private getMetricsSignificanceBetweenAnnotatorsForSeverity(): void {
    let severity = this.severityFormControl.value;
    this.annotationConsistencyService.getMetricsSignificanceBetweenAnnotatorsForSeverity(this.projectId, severity).subscribe((res: Map<string, Map<string, string>>) => 
      this.results.set('Metrics significance between annotators for severity ' + severity, res));
  }

  private isValidInput(): boolean {
    if (this.severityNeeded) return this.selectedConsistencyType != '' && this.severityFormControl.valid;
    return this.selectedConsistencyType != '';
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConsistencyType } from '../../model/enums/enums.model';

import { AnnotationService } from '../../annotation/annotation.service';
import { AnnotationConsistencyService } from '../../annotation-consistency/annotation-consistency.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private warningSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['warningSnackbar']};

  public showResultClicked = false;
  public results: Map<string, any> = new Map();
  public selectedResult: string = '';
  public resultDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) private projectId: number, private annotationConsistencyService: AnnotationConsistencyService, private _snackBar: MatSnackBar) { }

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
    this.annotationConsistencyService.getAnnotationConsistencyForAnnotator(this.projectId, AnnotationService.getLoggedInAnnotatorId()).subscribe((res: Map<string, string>) => 
      this.results.set('Consistency for my annotations', res));
  }

  private getAnnotationConsistencyBetweenAnnotatorsForSeverity(): void {
    let severity = this.severityFormControl.value;
    this.annotationConsistencyService.getAnnotationConsistencyBetweenAnnotatorsForSeverity(this.projectId, severity).subscribe((res: Map<string, string>) => 
      this.results.set('Consistency between annotators for severity ' + severity, res));
  }

  private getMetricsSignificanceInAnnotationsForAnnotator(): void {
    this.annotationConsistencyService.getMetricsSignificanceInAnnotationsForAnnotator(this.projectId, AnnotationService.getLoggedInAnnotatorId()).subscribe((res: Map<string, Map<string, string>>) => 
      this.results.set('Metrics significance for my annotations', res));
  }

  private getMetricsSignificanceBetweenAnnotatorsForSeverity(): void {
    let severity = this.severityFormControl.value;
    this.annotationConsistencyService.getMetricsSignificanceBetweenAnnotatorsForSeverity(this.projectId, severity).subscribe((res: Map<string, Map<string, string>>) => 
      this.results.set('Metrics significance between annotators for severity ' + severity, res));
  }

  private isValidInput(): boolean {
    if (this.selectedConsistencyType == '') {
      this._snackBar.open('Choose consistency type.', 'OK', this.warningSnackBarOptions);
    } else if (this.severityNeeded && (this.severityFormControl.hasError('min') || this.severityFormControl.hasError('max'))) {
      this._snackBar.open('Severity must be between 0 and 3.', 'OK', this.warningSnackBarOptions);
    } else if (this.severityNeeded && this.severityFormControl.hasError('required')) {
      this._snackBar.open('You must enter the severity.', 'OK', this.warningSnackBarOptions);
    }

    if (this.severityNeeded) return this.selectedConsistencyType != '' && this.severityFormControl.valid;
    return this.selectedConsistencyType != '';
  }
}

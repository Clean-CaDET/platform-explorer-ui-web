import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Severity } from 'src/app/modules/annotation-schema/model/severity/severity.model';
import { AnnotationSchemaService } from 'src/app/modules/annotation-schema/services/annotation-schema.service';
import { ConsistencyType } from '../../model/enums/enums.model';
import { AnnotationConsistencyService } from '../../services/annotation-consistency.service';
import { LocalStorageService } from '../../services/shared/local-storage.service';


@Component({
  selector: 'de-annotation-consistency-dialog',
  templateUrl: './annotation-consistency-dialog.component.html',
  styleUrls: ['./annotation-consistency-dialog.component.css']
})
export class AnnotationConsistencyDialogComponent implements OnInit {

  public consistencyTypes: string[] = Object.values(ConsistencyType);
  public selectedConsistencyType: string = '';
  public severityNeeded: boolean = false;
  public availableSeverities: Map<string, Severity[]> = new Map();
  public chosenSeverity: string | null = null;
  public typeFormControl: FormControl = new FormControl('', Validators.required);

  public showResultClicked = false;
  public results: Map<string, any> = new Map();
  public selectedResult: string = '';
  public resultDescription: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public projectIdAndSmell: [number, string],
    private annotationConsistencyService: AnnotationConsistencyService, 
    private storageService: LocalStorageService, private annotationSchemaService: AnnotationSchemaService) { }

  public ngOnInit(): void {
    this.typeFormControl.markAsTouched();
    this.annotationSchemaService.getSeveritiesForEachCodeSmell().subscribe(res => {
      for (let keyValue of Object.entries(res)) {
        this.availableSeverities.set(keyValue[0], keyValue[1]);
      }
    });
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
    this.annotationConsistencyService.getAnnotationConsistencyForAnnotator(Object(this.projectIdAndSmell)["data"][0], Number(this.storageService.getLoggedInAnnotator())).subscribe((res: Map<string, string>) => 
      this.results.set('Consistency for my annotations', res));
  }

  private getAnnotationConsistencyBetweenAnnotatorsForSeverity(): void {
    this.annotationConsistencyService.getAnnotationConsistencyBetweenAnnotatorsForSeverity(Object(this.projectIdAndSmell)["data"][0], this.chosenSeverity!).subscribe((res: Map<string, string>) => 
      this.results.set('Consistency between annotators for severity ' + this.chosenSeverity, res));
  }

  private getMetricsSignificanceInAnnotationsForAnnotator(): void {
    this.annotationConsistencyService.getMetricsSignificanceInAnnotationsForAnnotator(Object(this.projectIdAndSmell)["data"][0], Number(this.storageService.getLoggedInAnnotator())).subscribe((res: Map<string, Map<string, string>>) => 
      this.results.set('Metrics significance for my annotations', res));
  }

  private getMetricsSignificanceBetweenAnnotatorsForSeverity(): void {
    this.annotationConsistencyService.getMetricsSignificanceBetweenAnnotatorsForSeverity(Object(this.projectIdAndSmell)["data"][0], this.chosenSeverity!).subscribe((res: Map<string, Map<string, string>>) => 
      this.results.set('Metrics significance between annotators for severity ' + this.chosenSeverity, res));
  }

  private isValidInput(): boolean {
    if (this.severityNeeded) return this.selectedConsistencyType != '' && this.chosenSeverity != null;
    return this.selectedConsistencyType != '';
  }

  public severities(): Severity[] {
    return this.availableSeverities.get(this.projectIdAndSmell[1])!;
  }
}

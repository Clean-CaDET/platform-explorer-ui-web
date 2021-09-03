import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'de-annotation-consistency-dialog',
  templateUrl: './annotation-consistency-dialog.component.html',
  styleUrls: ['./annotation-consistency-dialog.component.css']
})
export class AnnotationConsistencyDialogComponent implements OnInit {

  public consistencyTypes: string[] = ['Single annotator consistency', 'Consistency between annotators', 
    'Single annotator metrics significance', 'Metrics significance between annotators'];
  public selectedConsistency: string = '';
  public annotatorNeeded: boolean = false;
  public severityNeeded: boolean = false;
  public severityFormControl = new FormControl('0', [
    Validators.required,
    Validators.min(0),
    Validators.max(3),
  ]);

  constructor(@Inject(MAT_DIALOG_DATA) private projectId: number) { }

  ngOnInit(): void {
  }

  public consistencyTypeChanged(): void {
    this.annotatorNeeded = false;
    this.severityNeeded = false;
    if (this.selectedConsistency == 'Single annotator consistency' || this.selectedConsistency == 'Single annotator metrics significance') {
      this.annotatorNeeded = true;
    } else {
      this.severityNeeded = true;
    }
  }

  public checkConsistency(): void {
  }

}

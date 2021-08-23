import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataSetAnnotation } from '../../model/data-set-annotation/data-set-annotation.model';

@Component({
  selector: 'de-disagreeing-annotations-dialog',
  templateUrl: './disagreeing-annotations-dialog.component.html',
  styleUrls: ['./disagreeing-annotations-dialog.component.css']
})
export class DisagreeingAnnotationsDialogComponent implements OnInit {

  public loggedAnnotatorId: number = +sessionStorage.getItem('annotatorID')!;

  constructor(@Inject(MAT_DIALOG_DATA) public annotationsWithInstanceId: AnnotationsWithInstanceId) { }

  ngOnInit(): void {
  }

}

interface AnnotationsWithInstanceId {
  annotations: DataSetAnnotation[],
  instanceId: number
}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataSetAnnotation } from '../../model/data-set-annotation/data-set-annotation.model';

import { UtilService } from 'src/app/util/util.service';

@Component({
  selector: 'de-disagreeing-annotations-dialog',
  templateUrl: './disagreeing-annotations-dialog.component.html',
  styleUrls: ['./disagreeing-annotations-dialog.component.css']
})
export class DisagreeingAnnotationsDialogComponent implements OnInit {

  public loggedAnnotatorId: number = UtilService.getAnnotatorId();

  constructor(@Inject(MAT_DIALOG_DATA) public instanceWithDisagreeingAnnotations: InstanceWithDisagreeingAnnotations) { }

  ngOnInit(): void {
  }

}

interface InstanceWithDisagreeingAnnotations {
  annotations: DataSetAnnotation[],
  instanceId: number
}

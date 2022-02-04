import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionStorageService } from 'src/app/session-storage.service';
import { Annotation } from '../../model/annotation/annotation.model';


@Component({
  selector: 'de-disagreeing-annotations-dialog',
  templateUrl: './disagreeing-annotations-dialog.component.html',
  styleUrls: ['./disagreeing-annotations-dialog.component.css']
})
export class DisagreeingAnnotationsDialogComponent implements OnInit {

  public loggedAnnotatorId: number = Number(this.sessionService.getLoggedInAnnotator());

  constructor(@Inject(MAT_DIALOG_DATA) public instanceWithDisagreeingAnnotations: InstanceWithDisagreeingAnnotations, private sessionService: SessionStorageService) { }

  ngOnInit(): void {
  }

}

interface InstanceWithDisagreeingAnnotations {
  annotations: Annotation[],
  instanceId: number
}

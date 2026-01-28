import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Annotation } from '../../model/annotation/annotation.model';
import { LocalStorageService } from '../../services/shared/local-storage.service';

import { MatButtonModule } from '@angular/material/button';
import { AnnotationFormComponent } from '../../annotation-form/annotation-form.component';


@Component({
    selector: 'de-disagreeing-annotations-dialog',
    templateUrl: './disagreeing-annotations-dialog.component.html',
    styleUrls: ['./disagreeing-annotations-dialog.component.css'],
      standalone: true,
  imports: [MatDialogModule, MatButtonModule, AnnotationFormComponent]

})
export class DisagreeingAnnotationsDialogComponent implements OnInit {

  public loggedAnnotatorId: number = Number(this.storageService.getLoggedInAnnotator());

  constructor(@Inject(MAT_DIALOG_DATA) public instanceWithDisagreeingAnnotations: InstanceWithDisagreeingAnnotations,
   private storageService: LocalStorageService) { }

  ngOnInit(): void {
  }

}

interface InstanceWithDisagreeingAnnotations {
  annotations: Annotation[],
  instanceId: number
}

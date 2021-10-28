import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataSetComponent } from './data-set.component';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';
import { AddProjectDialogComponent } from './dialogs/add-project-dialog/add-project-dialog.component';
import { DataSetProjectComponent } from './data-set-project/data-set-project.component';
import { InstanceComponent } from './instance/instance.component';
import { AnnotationComponent } from './annotation/annotation.component';
import { DisagreeingAnnotationsDialogComponent } from './dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component';
import { AnnotationConsistencyDialogComponent } from './dialogs/annotation-consistency-dialog/annotation-consistency-dialog.component';

@NgModule({
  declarations: [
    DataSetComponent,
    AddDataSetDialogComponent,
    AddProjectDialogComponent,
    DataSetProjectComponent,
    InstanceComponent,
    AnnotationComponent,
    DisagreeingAnnotationsDialogComponent,
    AnnotationConsistencyDialogComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DataSetModule { }

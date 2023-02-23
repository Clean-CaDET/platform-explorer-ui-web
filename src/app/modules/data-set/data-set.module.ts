import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';
import { AddProjectDialogComponent } from './dialogs/add-project-dialog/add-project-dialog.component';
import { DisagreeingAnnotationsDialogComponent } from './dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component';
import { AnnotationConsistencyDialogComponent } from './dialogs/annotation-consistency-dialog/annotation-consistency-dialog.component';
import { ExportDraftDataSetDialogComponent } from './dialogs/export-draft-data-set-dialog/export-draft-data-set-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { UpdateDataSetDialogComponent } from './dialogs/update-data-set-dialog/update-data-set-dialog.component';
import { UpdateProjectDialogComponent } from './dialogs/update-project-dialog/update-project-dialog.component';
import {
  AnnotationContainerComponent,
  ClassNamePipe,
  CouplingDetailsPipe,
} from './annotation-container/annotation-container.component';
import { DataSetComponent } from './data-set.component';
import { DataSetDetailComponent } from './data-set-detail/data-set-detail.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AnnotationFormComponent } from './annotation-form/annotation-form.component';
import { ProjectsComponent } from './projects/projects.component';
import { InstanceNamePipe, InstancesComponent } from './instances/instances.component';
import { AnnotationNoteDialogComponent } from './dialogs/annotation-note-dialog/annotation-note-dialog.component';
import { ForgotIdDialogComponent } from './dialogs/forgot-id-dialog/forgot-id-dialog.component';
import { ExportCompleteDataSetDialogComponent } from './dialogs/export-complete-data-set-dialog/export-complete-data-set-dialog.component';
import { CleanCodeAnalysisDialogComponent } from './dialogs/clean-code-analysis-dialog/clean-code-analysis-dialog.component';

@NgModule({
  declarations: [
    DataSetComponent,
    DataSetDetailComponent,
    ProjectsComponent,
    InstancesComponent,
    AddDataSetDialogComponent,
    AddProjectDialogComponent,
    ExportDraftDataSetDialogComponent,
    ExportCompleteDataSetDialogComponent,
    CleanCodeAnalysisDialogComponent,
    ConfirmDialogComponent,
    UpdateDataSetDialogComponent,
    UpdateProjectDialogComponent,
    AnnotationNoteDialogComponent,
    AnnotationFormComponent,
    DisagreeingAnnotationsDialogComponent,
    AnnotationConsistencyDialogComponent,
    AnnotationContainerComponent,
    CouplingDetailsPipe,
    ClassNamePipe,
    InstanceNamePipe,
    ForgotIdDialogComponent
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [AnnotationContainerComponent],
})
export class DataSetModule {}

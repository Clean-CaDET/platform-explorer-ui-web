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
import { AnnotationContainerComponent, ClassNamePipe, CouplingDetailsPipe } from './annotation-container/annotation-container.component';
import { DataSetComponent } from './data-set.component';
import { DataSetDetailComponent } from './data-set-detail/data-set-detail.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AnnotationFormComponent } from './annotation-form/annotation-form.component';
import { HeuristicReasonDialogComponent } from './dialogs/heuristic-reason-dialog/heuristic-reason-dialog.component';
import { ProjectsComponent } from './projects/projects.component';
import { InstancesComponent } from './instances/instances.component';


@NgModule({
  declarations: [
    DataSetComponent,
    DataSetDetailComponent,
    ProjectsComponent,
    InstancesComponent,
    AddDataSetDialogComponent,
    AddProjectDialogComponent,
    ExportDraftDataSetDialogComponent,
    HeuristicReasonDialogComponent,
    ConfirmDialogComponent,
    UpdateDataSetDialogComponent,
    UpdateProjectDialogComponent,
    AnnotationFormComponent,
    DisagreeingAnnotationsDialogComponent,
    AnnotationConsistencyDialogComponent,
    AnnotationContainerComponent,
    CouplingDetailsPipe,
    ClassNamePipe
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DataSetModule { }

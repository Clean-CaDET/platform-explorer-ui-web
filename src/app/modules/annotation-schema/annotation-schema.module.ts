import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnnotationSchemaComponent } from './annotation-schema.component';
import { UpdateCodeSmellDialogComponent } from './dialogs/update-code-smell-dialog/update-code-smell-dialog.component';
import { AddCodeSmellDialogComponent } from './dialogs/add-code-smell-dialog/add-code-smell-dialog.component';
import { AddHeuristicDialogComponent } from './dialogs/add-heuristic-dialog/add-heuristic-dialog.component';
import { UpdateHeuristicDialogComponent } from './dialogs/update-heuristic-dialog/update-heuristic-dialog.component';
import { CodeSmellDetailComponent } from './code-smell-detail/code-smell-detail.component';
import { RouterModule } from '@angular/router';
import { SeverityComponent } from './severity/severity.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';


@NgModule({
  declarations: [
    AnnotationSchemaComponent,
    UpdateCodeSmellDialogComponent,
    UpdateHeuristicDialogComponent,
    AddCodeSmellDialogComponent,
    AddHeuristicDialogComponent,
    CodeSmellDetailComponent,
    SeverityComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class AnnotationSchemaModule { }

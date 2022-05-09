import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnnotationSchemaComponent } from './annotation-schema.component';
import { SeverityRangeDialogComponent } from './dialogs/severity-range-dialog/severity-range-dialog.component';
import { SeverityValuesDialogComponent } from './dialogs/severity-values-dialog/severity-values-dialog.component';
import { UpdateCodeSmellDialogComponent } from './dialogs/update-code-smell-dialog/update-code-smell-dialog.component';
import { AddCodeSmellDialogComponent } from './dialogs/add-code-smell-dialog/add-code-smell-dialog.component';
import { AddHeuristicDialogComponent } from './dialogs/add-heuristic-dialog/add-heuristic-dialog.component';
import { UpdateHeuristicDialogComponent } from './dialogs/update-heuristic-dialog/update-heuristic-dialog.component';


@NgModule({
  declarations: [
    AnnotationSchemaComponent,
    SeverityRangeDialogComponent,
    SeverityValuesDialogComponent,
    UpdateCodeSmellDialogComponent,
    UpdateHeuristicDialogComponent,
    AddCodeSmellDialogComponent,
    AddHeuristicDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class AnnotationSchemaModule { }

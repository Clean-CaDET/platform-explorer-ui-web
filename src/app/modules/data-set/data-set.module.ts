import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataSetComponent } from './data-set.component';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';
import { AddProjectDialogComponent } from 'src/app/modules/data-set/dialogs/add-project-dialog/add-project-dialog.component';
import { DataSetProjectComponent } from './data-set-project/data-set-project.component';

@NgModule({
  declarations: [
    DataSetComponent,
    AddDataSetDialogComponent,
    AddProjectDialogComponent,
    DataSetProjectComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DataSetModule { }

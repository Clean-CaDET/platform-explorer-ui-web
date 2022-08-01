import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio'; 
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatRadioModule,
    MatMenuModule,
    MatChipsModule
  ],
  exports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatRadioModule,
    MatTabsModule,
    MatMenuModule,
    MatChipsModule
  ]
})
export class MaterialModule {}

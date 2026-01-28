
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'de-export-complete-data-set-dialog',
    templateUrl: './export-complete-data-set-dialog.component.html',
    styleUrls: ['./export-complete-data-set-dialog.component.css'],
      standalone: true,
  imports: [MatDialogModule, MatCardModule, MatButtonModule]

})
export class ExportCompleteDataSetDialogComponent {
    public selectedFiles: File[] = [];

    constructor(private dialogRef: MatDialogRef<ExportCompleteDataSetDialogComponent>){}

    public onFilesSelected(event: any) {
        const files = event.target.files;
        if (files) {
            this.selectedFiles = Array.from(files);
        }
    }

    public exportCompleteDataSet() {
        if (this.selectedFiles.length === 0) return;
        this.dialogRef.close(this.selectedFiles);
    }
}
import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CompleteDataSetExportDTO } from "../../model/DTOs/complete-dataset-export-dto/complete-dataset-export-dto.model";

@Component({
    selector: 'de-export-complete-data-set-dialog',
    templateUrl: './export-complete-data-set-dialog.component.html',
    styleUrls: ['./export-complete-data-set-dialog.component.css']
  })
export class ExportCompleteDataSetDialogComponent {
    public exportPath: string = '';
    public annotationsPath: string = '';

    constructor(private dialogRef: MatDialogRef<ExportCompleteDataSetDialogComponent>){}

    public exportCompleteDataSet() {
        if (!this.isValidInput()) return;
        this.dialogRef.close(new CompleteDataSetExportDTO({'annotationsPath': this.annotationsPath, 'exportPath': this.exportPath}));
    }

    private isValidInput(): boolean {
        return this.exportPath != '';
    }
}
import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'de-export-draft-data-set-dialog',
    templateUrl: './export-draft-data-set-dialog.component.html',
    styleUrls: ['./export-draft-data-set-dialog.component.css']
  })
export class ExportDraftDataSetDialogComponent {
    public exportPath: string = '';

    constructor(private dialogRef: MatDialogRef<ExportDraftDataSetDialogComponent>){}

    public exportDraftDataSet() {
        if (!this.isValidInput()) return;
        this.dialogRef.close(this.exportPath)
    }

    private isValidInput(): boolean {
        return this.exportPath != '';
    }
}
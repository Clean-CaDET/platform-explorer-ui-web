
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'de-export-draft-data-set-dialog',
    templateUrl: './export-draft-data-set-dialog.component.html',
    styleUrls: ['./export-draft-data-set-dialog.component.css'],
    standalone: true,
  imports: [MatDialogModule, MatCardModule, MatButtonModule]

})
export class ExportDraftDataSetDialogComponent {
    constructor(private dialogRef: MatDialogRef<ExportDraftDataSetDialogComponent>){}

    public exportDraftDataSet() {
        this.dialogRef.close(true);
    }
}
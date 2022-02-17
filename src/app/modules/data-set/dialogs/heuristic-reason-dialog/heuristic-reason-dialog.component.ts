import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'de-heuristic-reason-dialog',
    templateUrl: './heuristic-reason-dialog.component.html',
    styleUrls: ['./heuristic-reason-dialog.component.css']
  })
export class HeuristicReasonDialogComponent {
    public reason: string = '';

    constructor(@Inject(MAT_DIALOG_DATA) private heuristic: string,
    private dialogRef: MatDialogRef<HeuristicReasonDialogComponent>){
        this.reason = heuristic;
    }

    public addReason() {
        if (!this.isValidInput()) return;
        this.dialogRef.close(this.reason)
    }

    private isValidInput(): boolean {
        return this.reason != '';
    }
}
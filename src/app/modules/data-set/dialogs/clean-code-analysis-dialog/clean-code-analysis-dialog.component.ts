import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CleanCodeAnalysisDTO } from "../../model/DTOs/clean-code-analysis-export-dto/clean-code-analysis-export-dto.model";

@Component({
    selector: 'de-clean-code-analysis-dialog',
    templateUrl: './clean-code-analysis-dialog.component.html',
    styleUrls: ['./clean-code-analysis-dialog.component.css'],
    standalone: false
})
export class CleanCodeAnalysisDialogComponent {
    public cleanCodeOptions = [
        { name: 'Clean names', checked: true },
        { name: 'Clean functions', checked: true },
        { name: 'Clean classes', checked: true }
    ];

    constructor(private dialogRef: MatDialogRef<CleanCodeAnalysisDialogComponent>){}

    public exportAnalysis() {
        if (!this.isValidInput()) return;
        const selectedOptions = this.cleanCodeOptions
            .filter(option => option.checked)
            .map(option => option.name);
        this.dialogRef.close(new CleanCodeAnalysisDTO({'cleanCodeOptions': selectedOptions}));
    }

    private isValidInput(): boolean {
        return this.cleanCodeOptions.some(option => option.checked);
    }
}
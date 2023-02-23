import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CleanCodeAnalysisDTO } from "../../model/DTOs/clean-code-analysis-export-dto/clean-code-analysis-export-dto.model";

@Component({
    selector: 'de-clean-code-analysis-dialog',
    templateUrl: './clean-code-analysis-dialog.component.html',
    styleUrls: ['./clean-code-analysis-dialog.component.css']
  })
export class CleanCodeAnalysisDialogComponent {
    public exportPath: string = '';
    public chosenCleanCodeOptions: string[] = [];
    public cleanCodeOptions: string[] = ['Clean names', 'Clean functions', 'Clean classes'];
    
    constructor(private dialogRef: MatDialogRef<CleanCodeAnalysisDialogComponent>){}

    public exportAnalysis() {
        if (!this.isValidInput()) return;
        this.dialogRef.close(new CleanCodeAnalysisDTO({'exportPath': this.exportPath, 'cleanCodeOptions': this.chosenCleanCodeOptions}));
    }

    private isValidInput(): boolean {
        return this.exportPath != '' && this.cleanCodeOptions.length > 0;
    }
}
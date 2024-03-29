import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AddDataSetDialogComponent } from "./dialogs/add-data-set-dialog/add-data-set-dialog.component";
import { CleanCodeAnalysisDialogComponent } from "./dialogs/clean-code-analysis-dialog/clean-code-analysis-dialog.component";
import { ConfirmDialogComponent } from "./dialogs/confirm-dialog/confirm-dialog.component";
import { DialogConfigService } from "./dialogs/dialog-config.service";
import { ExportCompleteDataSetDialogComponent } from "./dialogs/export-complete-data-set-dialog/export-complete-data-set-dialog.component";
import { ExportDraftDataSetDialogComponent } from "./dialogs/export-draft-data-set-dialog/export-draft-data-set-dialog.component";
import { UpdateDataSetDialogComponent } from "./dialogs/update-data-set-dialog/update-data-set-dialog.component";
import { DataSet } from "./model/data-set/data-set.model";
import { CleanCodeAnalysisDTO } from "./model/DTOs/clean-code-analysis-export-dto/clean-code-analysis-export-dto.model";
import { CompleteDataSetExportDTO } from "./model/DTOs/complete-dataset-export-dto/complete-dataset-export-dto.model";
import { DataSetService } from "./services/data-set.service";
import { LocalStorageService } from "./services/shared/local-storage.service";


@Component({
    selector: 'de-data-set',
    templateUrl: './data-set.component.html',
    styleUrls: ['./data-set.component.css']
})
export class DataSetComponent implements OnInit {

    private datasets: DataSet[] = [];
    public dataSource = new MatTableDataSource<DataSet>();
    public displayedColumns = ['name', 'numOfProjects', 'actions'];

    private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
    @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
        this.dataSource.paginator = this.paginator;
    }

    constructor(private dialog: MatDialog, private toastr: ToastrService, 
        private datasetService: DataSetService, private router: Router,
        private storageService: LocalStorageService) {}

    public async ngOnInit(): Promise<void> {
        if (!this.storageService.getLoggedInAnnotator()) this.router.navigate(['/login']);
        var res = await this.datasetService.getAllDataSets();
        res.map(d => this.datasets.push(new DataSet({id: d.id, name: d.name, projectsCount: d.projectsCount, projects: []})))
        this.dataSource.data = this.datasets;
    }

    public addDataSet(): void {
        let dialogRef = this.dialog.open(AddDataSetDialogComponent);
        dialogRef.afterClosed().subscribe((dataset: DataSet) => {
            if (dataset) {
                this.datasets.push(dataset);
                this.dataSource.data = this.datasets;
            }
        });
    }

    public updateDataSet(dataset: DataSet): void {
        let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', dataset);
        let dialogRef = this.dialog.open(UpdateDataSetDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((updated: DataSet) => {
            if (updated) this.toastr.success('Updated dataset ' + updated.name);
        });
    }

    public deleteDataSet(dataset: DataSet): void {
        let dialogRef = this.dialog.open(ConfirmDialogComponent);
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (!confirmed) return;
            this.datasetService.deleteDataSet(dataset.id).subscribe(deleted => {
                this.datasets.splice(this.datasets.findIndex(d => d.id == deleted.id), 1);
                this.dataSource.data = this.datasets;
            });
        });
    }

    public exportDraftDataSet(dataset: DataSet): void {
        let dialogRef = this.dialog.open(ExportDraftDataSetDialogComponent);
        dialogRef.afterClosed().subscribe((exportPath: string) => {
            if (exportPath == '') return;
            this.datasetService.exportDraftDataSet(dataset.id, exportPath).subscribe(res => {
                let message = new Map(Object.entries(res)).get('successes')[0]['message'];
                this.toastr.success(message);
            });
        });
    }

    public exportCompleteDataSet(dataset: DataSet): void {
        let dialogRef = this.dialog.open(ExportCompleteDataSetDialogComponent);
        dialogRef.afterClosed().subscribe((exportDTO: CompleteDataSetExportDTO) => {
            if (exportDTO.exportPath == '') return;
            this.datasetService.exportCompleteDataSet(dataset.id, exportDTO).subscribe(res => {
                let message = new Map(Object.entries(res)).get('successes')[0]['message'];
                this.toastr.success(message);
            });
        });
    }

    public cleanCodeAnalysis(dataset: DataSet): void {
        let dialogRef = this.dialog.open(CleanCodeAnalysisDialogComponent);
        dialogRef.afterClosed().subscribe((analysisOptions: CleanCodeAnalysisDTO) => {
            if (analysisOptions.exportPath == '') return;
            this.datasetService.cleanCodeAnalysis(dataset.id, analysisOptions).subscribe(res => {
                let message = new Map(Object.entries(res)).get('successes')[0]['message'];
                this.toastr.success(message);
            });
        });
    }

    public searchDataSets(event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        this.dataSource.data = this.datasets.filter(s => s.name.toLowerCase().includes(input.toLowerCase()));
    }

    public chooseDataset(dataset: DataSet): void {
        this.storageService.clearSmellFilter();
        this.router.navigate(['/datasets', dataset.id]);
    }
}
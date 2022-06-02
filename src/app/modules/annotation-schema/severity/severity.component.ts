import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { DialogConfigService } from "../../data-set/dialogs/dialog-config.service";
import { AddSeverityDialogComponent } from "../dialogs/add-severity-dialog/add-severity-dialog.component";
import { ConfirmDialogComponent } from "../dialogs/confirm-dialog/confirm-dialog.component";
import { UpdateSeverityDialogComponent } from "../dialogs/update-severity-dialog/update-severity-dialog.component";
import { CodeSmellDefinition } from "../model/code-smell-definition/code-smell-definition.model";
import { Heuristic } from "../model/heuristic/heuristic.model";
import { Severity } from "../model/severity/severity.model";
import { AnnotationSchemaService } from "../services/annotation-schema.service";


@Component({
  selector: 'de-severity',
  templateUrl: './severity.component.html',
  styleUrls: ['./severity.component.css']
})

export class SeverityComponent implements OnInit {

  @Input() public chosenCodeSmell: CodeSmellDefinition;
  public severitiesDisplayedColumns = ['value', 'description', 'edit', 'delete'];
  public severitiesDataSource = new MatTableDataSource<Severity>();

  @ViewChild(MatTable) public table : MatTable<Heuristic>;

  constructor(private annotationSchemaService: AnnotationSchemaService,
    private toastr: ToastrService, public dialog: MatDialog) {
  }

  public ngOnInit() {
  }

  public ngOnChanges() {
    this.severitiesDataSource.data = this.chosenCodeSmell.severities;
  }

  public searchSeverities(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.severitiesDataSource.data = this.chosenCodeSmell.severities.filter(s => s.value.toLowerCase().includes(input.toLowerCase()));
  }

  public addSeverity(): void {
    let dialogRef = this.dialog.open(AddSeverityDialogComponent);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe(createdSeverity => {
      if (createdSeverity == '') return;
      this.annotationSchemaService.addSeverityToCodeSmell(this.chosenCodeSmell.id, createdSeverity)
      .subscribe(res => {
        this.severitiesDataSource.data.push(res);
        this.table.renderRows();
      });
    });
  }

  public removeSeverity(severity: Severity): void {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', 'Annotations containing this severity will be deleted.');
    let dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.severitiesDataSource.data.splice(this.severitiesDataSource.data.findIndex(s => s.id == severity.id), 1);
        this.annotationSchemaService.removeSeverityFromCodeSmell(this.chosenCodeSmell.id, severity.id)
          .subscribe(() => this.table.renderRows());
      }
    });
  }

  public updateSeverity(severity: Severity): void {
    let dialogRef = this.dialog.open(UpdateSeverityDialogComponent, {
      data: [this.chosenCodeSmell, severity]
    });
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((updated: Severity) => {
      if (updated) this.toastr.success('Updated severity ' + updated.value);
    });
  }
}

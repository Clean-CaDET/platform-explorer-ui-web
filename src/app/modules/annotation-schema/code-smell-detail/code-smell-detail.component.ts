import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Params } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DialogConfigService } from "../../data-set/dialogs/dialog-config.service";
import { AddHeuristicDialogComponent } from "../dialogs/add-heuristic-dialog/add-heuristic-dialog.component";
import { ConfirmDialogComponent } from "../dialogs/confirm-dialog/confirm-dialog.component";
import { UpdateHeuristicDialogComponent } from "../dialogs/update-heuristic-dialog/update-heuristic-dialog.component";
import { CodeSmellDefinition } from "../model/code-smell-definition/code-smell-definition.model";
import { Heuristic } from "../model/heuristic/heuristic.model";
import { AnnotationSchemaService } from "../services/annotation-schema.service";


@Component({
  selector: 'de-code-smell-detail',
  templateUrl: './code-smell-detail.component.html',
  styleUrls: ['./code-smell-detail.component.css']
})

export class CodeSmellDetailComponent implements OnInit {

  public chosenCodeSmell: CodeSmellDefinition;
  public heuristicsDisplayedColumns = ['name', 'description', 'edit', 'delete'];
  public heuristicsDataSource = new MatTableDataSource<Heuristic>();
  public chosenSeverityType: string = '';

  @ViewChild(MatTable) public table : MatTable<Heuristic>;

  constructor(private route: ActivatedRoute, private annotationSchemaService: AnnotationSchemaService,
    private toastr: ToastrService, public dialog: MatDialog) {
  }

  public ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.loadCodeSmell(params);
    });
  }

  private loadCodeSmell(params: Params) {
    if (params["id"] == undefined) return;
    this.annotationSchemaService.getCodeSmellDefinition(params["id"]).subscribe(res => {
      this.chosenCodeSmell = res;
      this.heuristicsDataSource.data = this.chosenCodeSmell.heuristics;
      this.setSeverityType();
    });
  }

  private setSeverityType() {
    if (this.chosenCodeSmell.severityValues.length != 0) {
      this.chosenSeverityType = 'textual';
    } else {
      this.chosenSeverityType = 'numerical';
    }
  }

  public searchHeuristics(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.heuristicsDataSource.data = this.chosenCodeSmell.heuristics.filter(h => h.name.toLowerCase().includes(input.toLowerCase()));
  }

  public addHeuristic(): void {
    let dialogRef = this.dialog.open(AddHeuristicDialogComponent);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe(createdHeuristic => {
      if (createdHeuristic == '') return;
      this.annotationSchemaService.addHeuristicToCodeSmell(this.chosenCodeSmell.id, createdHeuristic)
      .subscribe(res => {
        this.heuristicsDataSource.data.push(res);
        this.table.renderRows();
      });
    });
  }

  public removeHeuristic(heuristic: Heuristic): void {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', 'Deleted heuristic will be removed from the existing annotations.');
    let dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.heuristicsDataSource.data.splice(this.heuristicsDataSource.data.findIndex(h => h.id == heuristic.id), 1);
        this.annotationSchemaService.removeHeuristicFromCodeSmell(this.chosenCodeSmell.id, heuristic.id)
          .subscribe(() => this.table.renderRows());
      }
    });
  }

  public updateHeuristic(heuristic: Heuristic): void {
    let dialogRef = this.dialog.open(UpdateHeuristicDialogComponent, {
      data: [this.chosenCodeSmell, heuristic]
    });
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((updated: Heuristic) => {
      if (updated) this.toastr.success('Updated heuristic ' + updated.name);
    });
  }
}

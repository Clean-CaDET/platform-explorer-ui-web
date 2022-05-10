import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Params } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AddHeuristicDialogComponent } from "../dialogs/add-heuristic-dialog/add-heuristic-dialog.component";
import { UpdateHeuristicDialogComponent } from "../dialogs/update-heuristic-dialog/update-heuristic-dialog.component";
import { CodeSmellDefinition } from "../model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType } from "../model/enums/enums.model";
import { Heuristic } from "../model/heuristic/heuristic.model";
import { CodeSmellDefinitionService } from "../services/code-smell-definition.service";


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
  public deletedSeverityValues: string[] = [];
  public addedSeverityValues: string[] = [];
  public newSeverityValue: string = '';

  @ViewChild(MatTable) public table : MatTable<Heuristic>;

  constructor(private route: ActivatedRoute, private codeSmellDefinitionService: CodeSmellDefinitionService,
    private toastr: ToastrService, public dialog: MatDialog) {
  }

  public ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.loadCodeSmell(params);
    });
  }

  private loadCodeSmell(params: Params) {
    this.codeSmellDefinitionService.getCodeSmellDefinition(params["id"]).subscribe(res => {
      this.chosenCodeSmell = res;
      this.heuristicsDataSource.data = this.chosenCodeSmell.heuristics;
      this.setSeverity();
    });
  }

  private setSeverity() {
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
      this.codeSmellDefinitionService.addHeuristicToCodeSmell(this.chosenCodeSmell.id, createdHeuristic)
      .subscribe(res => {
        this.heuristicsDataSource.data.push(res);
        this.table.renderRows();
      });
    });
  }

  public removeHeuristic(heuristic: Heuristic): void {
    this.heuristicsDataSource.data.splice(this.heuristicsDataSource.data.findIndex(h => h.id == heuristic.id), 1);
    this.codeSmellDefinitionService.removeHeuristicFromCodeSmell(this.chosenCodeSmell.id, heuristic.id)
    .subscribe(res => this.table.renderRows());
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

  public removeValue(value: string): void {
    var deletedValues = this.chosenCodeSmell.severityValues.splice(this.chosenCodeSmell.severityValues.findIndex(v => v == value), 1);
    if (deletedValues) this.deletedSeverityValues = deletedValues.concat(this.deletedSeverityValues);
  }

  public addValue(): void {
    if (this.newSeverityValue.trim() == '') return;
    this.chosenCodeSmell.severityValues.push(this.newSeverityValue);
    this.addedSeverityValues.push(this.newSeverityValue);
    this.newSeverityValue = '';
  }

  public save(): void {
    this.chosenCodeSmell = numberToSnippetType(this.chosenCodeSmell);
    this.codeSmellDefinitionService.updateCodeSmellDefinition(this.chosenCodeSmell.id, this.chosenCodeSmell)
      .subscribe(() => {
        this.toastr.success('Updated severity!');
      });
  }

  public cancel(): void {
    var severityValues = this.chosenCodeSmell.severityValues.concat(this.deletedSeverityValues);
    this.chosenCodeSmell.severityValues = Array.from(new Set(severityValues));
    this.chosenCodeSmell.severityValues = this.chosenCodeSmell.severityValues.filter(c => !this.addedSeverityValues.includes(c));
  }
}

import { Component, Inject, ViewChild } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { CodeSmellDefinitionService } from "../../services/code-smell-definition.service";
import { CodeSmellDefinition } from "../../model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType } from "../../model/enums/enums.model";
import { Heuristic } from "../../model/heuristic/heuristic.model";
import { AddHeuristicDialogComponent } from "../add-heuristic-dialog/add-heuristic-dialog.component";
import { ToastrService } from "ngx-toastr";
import { UpdateHeuristicDialogComponent } from "../update-heuristic-dialog/update-heuristic-dialog.component";

@Component({
  selector: 'de-heuristics-dialog',
  templateUrl: './heuristics-dialog.component.html',
  styleUrls: ['./heuristics-dialog.component.css']
})
export class HeuristicsDialogComponent {
  public codeSmellDefinition: CodeSmellDefinition | null = null;
  public codeSmellHeuristics: Heuristic[] = [];
  public displayedColumns = ['name', 'description', 'edit', 'delete'];
  public dataSource = new MatTableDataSource<Heuristic>();

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CodeSmellDefinition, private toastr: ToastrService,
  private codeSmellDefinitionService: CodeSmellDefinitionService, public dialog: MatDialog) {
    this.codeSmellDefinition = data;

    this.codeSmellDefinitionService.getHeuristicsForCodeSmell(this.codeSmellDefinition.id).subscribe(res => {
      this.codeSmellHeuristics = res;
      this.dataSource.data =  this.codeSmellHeuristics;
    })
  }

  public searchHeuristics(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.codeSmellHeuristics.filter(h => h.name.toLowerCase().includes(input.toLowerCase()));
  }

  public removeHeuristic(heuristic: Heuristic): void {
    this.codeSmellHeuristics.splice(this.codeSmellHeuristics.findIndex(h => h.id == heuristic.id), 1);
    this.codeSmellDefinition = numberToSnippetType(this.codeSmellDefinition!);
    this.codeSmellDefinitionService.removeHeuristicFromCodeSmell(this.codeSmellDefinition?.id!, heuristic.id)
    .subscribe(res => this.table.renderRows());
  }

  public addHeuristic(): void {
    let dialogRef = this.dialog.open(AddHeuristicDialogComponent);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe(createdHeuristic => {
      if (createdHeuristic == '') return;
      this.dataSource.data.push(createdHeuristic);
      this.table.renderRows();
      this.codeSmellDefinition = numberToSnippetType(this.codeSmellDefinition!);
      this.codeSmellDefinitionService.addHeuristicToCodeSmell(this.codeSmellDefinition?.id!, createdHeuristic)
      .subscribe();
    });
  }

  public updateHeuristic(heuristic: Heuristic): void {
    let dialogRef = this.dialog.open(UpdateHeuristicDialogComponent, {
      data: [this.codeSmellDefinition, heuristic]
    });
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((updated: Heuristic) => {
      if (updated) this.toastr.success('Updated heuristic ' + updated.name);
    });
  }
}
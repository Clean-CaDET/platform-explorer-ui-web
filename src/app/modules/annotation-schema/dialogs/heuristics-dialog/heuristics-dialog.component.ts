import { Component, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { AnnotationSchemaService } from "../../annotation-schema.service";
import { CodeSmellDefinition } from "../../model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType } from "../../model/enums/enums.model";
import { Heuristic } from "../../model/heuristic/heuristic.model";

@Component({
  selector: 'de-heuristics-dialog',
  templateUrl: './heuristics-dialog.component.html',
  styleUrls: ['./heuristics-dialog.component.css']
})
export class HeuristicsDialogComponent {
  public codeSmellDefinition: CodeSmellDefinition | null = null;
  public codeSmellHeuristics: Heuristic[] = [];
  public heuristics: Heuristic[] = [];
  public chosenHeuristics: Heuristic[] = [];
  public showHeuristicSelection: boolean = false;
  public displayedColumns = ['name', 'description', 'delete'];
  public dataSource = new MatTableDataSource<Heuristic>();

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CodeSmellDefinition,  private dialogRef: MatDialogRef<HeuristicsDialogComponent>, 
  public annotationSchemaService: AnnotationSchemaService) {
    this.codeSmellDefinition = data;

    this.annotationSchemaService.getHeuristicsForCodeSmell(this.codeSmellDefinition.id).subscribe(res => {
      this.codeSmellHeuristics = res;
      this.dataSource.data =  this.codeSmellHeuristics;
    })

    this.annotationSchemaService.getAllHeuristics().subscribe(res => {
      this.heuristics = res;
    })
  }

  public searchHeuristics(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.codeSmellHeuristics.filter(h => h.name.toLowerCase().includes(input.toLowerCase()));
  }

  public removeHeuristic(heuristic: Heuristic): void {
    this.codeSmellHeuristics.splice(this.codeSmellHeuristics.findIndex(h => h.id == heuristic.id), 1);
    this.codeSmellDefinition = numberToSnippetType(this.codeSmellDefinition!);
    this.annotationSchemaService.removeHeuristicFromCodeSmell(this.codeSmellDefinition?.id!, heuristic.id)
    .subscribe(res => this.table.renderRows());
  }

  public addHeuristic(): void {
    this.showHeuristicSelection = true;
    this.codeSmellHeuristics.forEach(heuristic => {
      this.heuristics.splice(this.heuristics.findIndex(h => h.id == heuristic.id), 1);
    });
  }

  public addHeuristicsToCodeSmell(): void {
    this.chosenHeuristics.forEach(h => {
      this.codeSmellHeuristics.push(h);
    });
    this.dataSource.data = this.codeSmellHeuristics;
    this.codeSmellDefinition = numberToSnippetType(this.codeSmellDefinition!);
    this.annotationSchemaService.addHeuristicsToCodeSmell(this.codeSmellDefinition?.id!, this.chosenHeuristics)
    .subscribe();
    this.showHeuristicSelection = false;
  }
}
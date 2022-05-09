import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { ConfirmDialogComponent } from "../data-set/dialogs/confirm-dialog/confirm-dialog.component";
import { CodeSmellDefinitionService } from "./services/code-smell-definition.service";
import { AddCodeSmellDialogComponent } from "./dialogs/add-code-smell-dialog/add-code-smell-dialog.component";
import { HeuristicsDialogComponent } from "./dialogs/heuristics-dialog/heuristics-dialog.component";
import { SeverityRangeDialogComponent } from "./dialogs/severity-range-dialog/severity-range-dialog.component";
import { SeverityValuesDialogComponent } from "./dialogs/severity-values-dialog/severity-values-dialog.component";
import { UpdateCodeSmellDialogComponent } from "./dialogs/update-code-smell-dialog/update-code-smell-dialog.component";
import { CodeSmellDefinition } from "./model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType, SnippetType } from "./model/enums/enums.model";


@Component({
    selector: 'de-annotation-schema',
    templateUrl: './annotation-schema.component.html',
    styleUrls: ['./annotation-schema.component.css']
  })
  
export class AnnotationSchemaComponent implements OnInit {

  public codeSmellDefinitions: CodeSmellDefinition[] = [];
  public codeSmellsDisplayedColumns = ['name', 'description', 'snippetType', 'heuristics', 'severityRange', 'severityValues', 'edit', 'delete'];
  public codeSmellsDataSource = new MatTableDataSource<CodeSmellDefinition>();
  public selectedSnippetType: SnippetType | null = null;
  public snippetTypes: string[] = Object.keys(SnippetType);

  @ViewChild(MatTable) codeSmellsTable: MatTable<CodeSmellDefinition>;

  constructor(private codeSmellDefinitionService: CodeSmellDefinitionService,
    public dialog: MatDialog, private toastr: ToastrService) {}

  ngOnInit() {
    this.snippetTypes.push('All');
    this.codeSmellDefinitionService.getAllCodeSmellDefinitions().subscribe(res => {
      this.codeSmellDefinitions = res;
      this.codeSmellsDataSource.data = this.codeSmellDefinitions.map(cs => numberToSnippetType(cs));
    });
  }
  
  public addCodeSmell(): void {
    let dialogRef = this.dialog.open(AddCodeSmellDialogComponent);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe(createdCodeSmell => {
      if (createdCodeSmell == '') return;
      this.codeSmellsDataSource.data.push(numberToSnippetType(createdCodeSmell));
      this.codeSmellsTable.renderRows();
    });
  }

  public searchCodeSmells(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.codeSmellsDataSource.data = this.codeSmellDefinitions.filter(c => c.name.toLowerCase().includes(input.toLowerCase()));
  }

  public showHeuristics(codeSmellDefinition: CodeSmellDefinition): void {
    let dialogRef = this.dialog.open(HeuristicsDialogComponent, {
      data: codeSmellDefinition,
    });
    dialogRef.updateSize('50%');
  }

  public showSeverityRange(codeSmellDefinition: CodeSmellDefinition): void {
    let dialogRef = this.dialog.open(SeverityRangeDialogComponent, {
      data: codeSmellDefinition,
    });
    dialogRef.updateSize('30%');
  }

  public showSeverityValues(codeSmellDefinition: CodeSmellDefinition): void {
    let dialogRef = this.dialog.open(SeverityValuesDialogComponent, {
      data: codeSmellDefinition,
    });
    dialogRef.updateSize('30%');
  }

  public updateCodeSmellDefinition(codeSmellDefinition: CodeSmellDefinition): void {
    let dialogRef = this.dialog.open(UpdateCodeSmellDialogComponent, {
      data: codeSmellDefinition
    });
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((updated: CodeSmellDefinition) => {
      if (updated) this.toastr.success('Updated code smell ' + updated.name);
    });
  }

  public deleteCodeSmellDefinition(codeSmellDefinition: CodeSmellDefinition): void {
    let dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.codeSmellDefinitionService.deleteCodeSmellDefinition(codeSmellDefinition.id).subscribe(deleted => {
        this.codeSmellDefinitions.splice(this.codeSmellDefinitions.findIndex(c => c.id == codeSmellDefinition.id), 1);
        this.codeSmellsDataSource.data = this.codeSmellDefinitions;
      });
    });
  }

  public filterBySnippetType() {
    this.codeSmellDefinitionService.getAllCodeSmellDefinitions().subscribe(res => {
      this.codeSmellsDataSource.data = res.map(smell => numberToSnippetType(smell));
      if (this.snippetTypeSelected()) this.codeSmellsDataSource.data = this.codeSmellsDataSource.data.filter(smell => smell.snippetType == this.selectedSnippetType);
    });
  }

  private snippetTypeSelected(): boolean {
    return this.selectedSnippetType == SnippetType.Class || this.selectedSnippetType == SnippetType.Function;
  }
}
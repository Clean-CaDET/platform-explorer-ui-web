import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { AddCodeSmellDialogComponent } from "./dialogs/add-code-smell-dialog/add-code-smell-dialog.component";
import { UpdateCodeSmellDialogComponent } from "./dialogs/update-code-smell-dialog/update-code-smell-dialog.component";
import { CodeSmellDefinition } from "./model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType, SnippetType } from "./model/enums/enums.model";
import { ActivatedRoute, Router } from "@angular/router";
import { AnnotationSchemaService } from "./services/annotation-schema.service";
import { ConfirmDialogComponent } from "./dialogs/confirm-dialog/confirm-dialog.component";
import { DialogConfigService } from "../data-set/dialogs/dialog-config.service";


@Component({
    selector: 'de-annotation-schema',
    templateUrl: './annotation-schema.component.html',
    styleUrls: ['./annotation-schema.component.css'],
    standalone: false
})
  
export class AnnotationSchemaComponent implements OnInit {

  public codeSmellDefinitions: CodeSmellDefinition[] = [];
  public codeSmellsDisplayedColumns = ['name', 'description', 'snippetType', 'actions'];
  public codeSmellsDataSource = new MatTableDataSource<CodeSmellDefinition>();
  public selectedSnippetType: string = 'All';
  public snippetTypes: string[] = Object.keys(SnippetType);
  public chosenCodeSmell: CodeSmellDefinition | undefined;

  @ViewChild(MatTable) public table : MatTable<CodeSmellDefinition>;
  constructor(private annotationSchemaService: AnnotationSchemaService,
    public dialog: MatDialog, private route: ActivatedRoute,
    private toastr: ToastrService, private router: Router) {}

  ngOnInit() {
    this.snippetTypes.push('All');
    this.annotationSchemaService.getAllCodeSmellDefinitions().subscribe(res => {
      this.codeSmellDefinitions = res;
      this.codeSmellsDataSource.data = this.codeSmellDefinitions.map(cs => numberToSnippetType(cs));
    });
    var idFromPath = this.route.firstChild?.snapshot.params["id"];
    if (idFromPath != undefined) this.annotationSchemaService.getCodeSmellDefinition(idFromPath).subscribe(res => this.chosenCodeSmell = res);
  }
  
  public addCodeSmell(): void {
    let dialogRef = this.dialog.open(AddCodeSmellDialogComponent, {
      data: this.codeSmellDefinitions
    });
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe(createdCodeSmell => {
      if (createdCodeSmell == '') return;
      this.codeSmellDefinitions.push(numberToSnippetType(createdCodeSmell));
      this.codeSmellsDataSource.data = this.codeSmellDefinitions;
      this.table.renderRows();
    });
  }

  public searchCodeSmells(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.codeSmellsDataSource.data = this.codeSmellDefinitions.filter(c => c.name.toLowerCase().includes(input.toLowerCase()));
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
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', 'Candidate instances and instances annotated for this code smell will be deleted.');
    let dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.updateSize('20%');
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.annotationSchemaService.deleteCodeSmellDefinition(codeSmellDefinition.id).subscribe(deleted => {
        this.codeSmellDefinitions.splice(this.codeSmellDefinitions.findIndex(c => c.id == codeSmellDefinition.id), 1);
        this.codeSmellsDataSource.data = this.codeSmellDefinitions;
        this.router.navigate(['annotation-schema']);
      });
    });
  }

  public filterBySnippetType() {
    this.annotationSchemaService.getAllCodeSmellDefinitions().subscribe(res => {
      this.codeSmellsDataSource.data = res.map(smell => numberToSnippetType(smell));
      if (this.snippetTypeSelected()) this.codeSmellsDataSource.data = this.codeSmellsDataSource.data.filter(smell => smell.snippetType == this.selectedSnippetType);
    });
  }

  private snippetTypeSelected(): boolean {
    return this.selectedSnippetType == SnippetType.Class || this.selectedSnippetType == SnippetType.Function;
  }

  public chooseCodeSmell(chosenSmell: CodeSmellDefinition) {
    this.chosenCodeSmell = chosenSmell;
    this.router.navigate(['annotation-schema/code-smells/', chosenSmell.id]);
  }
}
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTable } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CodeSmellDefinition } from "../model/code-smell-definition/code-smell-definition.model";
import { numberToSnippetType } from "../model/enums/enums.model";
import { Heuristic } from "../model/heuristic/heuristic.model";
import { CodeSmellDefinitionService } from "../services/code-smell-definition.service";


@Component({
  selector: 'de-severity',
  templateUrl: './severity.component.html',
  styleUrls: ['./severity.component.css']
})

export class SeverityComponent implements OnInit {

  @Input() public chosenCodeSmell: CodeSmellDefinition;
  @Input() public chosenSeverityType: string = '';
  public deletedSeverityValues: string[] = [];
  public addedSeverityValues: string[] = [];
  public newSeverityValue: string = '';

  @ViewChild(MatTable) public table : MatTable<Heuristic>;

  constructor(private codeSmellDefinitionService: CodeSmellDefinitionService,
    private toastr: ToastrService, public dialog: MatDialog) {
  }

  public ngOnInit() {
  }

  public removeSeverityValue(value: string): void {
    var deletedValues = this.chosenCodeSmell.severityValues.splice(this.chosenCodeSmell.severityValues.findIndex(v => v == value), 1);
    if (deletedValues) this.deletedSeverityValues = deletedValues.concat(this.deletedSeverityValues);
  }

  public addSeverityValue(): void {
    if (this.newSeverityValue.trim() == '') return;
    this.chosenCodeSmell.severityValues.push(this.newSeverityValue);
    this.addedSeverityValues.push(this.newSeverityValue);
    this.newSeverityValue = '';
  }

  public saveSeverities(): void {
    this.chosenCodeSmell = numberToSnippetType(this.chosenCodeSmell);
    this.codeSmellDefinitionService.updateCodeSmellDefinition(this.chosenCodeSmell.id, this.chosenCodeSmell)
      .subscribe(() => {
        this.deletedSeverityValues = [];
        this.addedSeverityValues = [];
        this.toastr.success('Updated severity!');
      });
  }

  public cancel(): void {
    var severityValues = this.chosenCodeSmell.severityValues.concat(this.deletedSeverityValues);
    this.chosenCodeSmell.severityValues = Array.from(new Set(severityValues));
    this.chosenCodeSmell.severityValues = this.chosenCodeSmell.severityValues.filter(c => !this.addedSeverityValues.includes(c));
  }
}

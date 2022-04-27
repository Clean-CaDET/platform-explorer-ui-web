import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { Heuristic } from '../../model/heuristic/heuristic.model';
import { HeuristicDefinitionService } from '../../services/heuristic-definition.service';


@Component({
  selector: 'de-add-heuristic-dialog',
  templateUrl: './add-heuristic-dialog.component.html',
  styleUrls: ['./add-heuristic-dialog.component.css']
})

export class AddHeuristicDialogComponent implements OnInit {

  public name: string = '';
  public description: string = '';

  constructor(private dialogRef: MatDialogRef<AddHeuristicDialogComponent>, 
    private heuristicDefinitionService: HeuristicDefinitionService) { }

  ngOnInit(): void {
  }

  public createHeuristic() {
    if (!this.isValidInput()) return;
    
    let heuristic = new Heuristic({name: this.name, description: this.description});
    this.heuristicDefinitionService.createHeuristic(heuristic)
    .subscribe((res: Heuristic) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.name != '' && this.description != '';
  }
}

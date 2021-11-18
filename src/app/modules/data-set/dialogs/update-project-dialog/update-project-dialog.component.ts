import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataSetService } from '../../data-set.service';
import { DataSetProject } from '../../model/data-set-project/data-set-project.model';

@Component({
  selector: 'de-update-project-dialog',
  templateUrl: './update-project-dialog.component.html',
  styleUrls: ['./update-project-dialog.component.css']
})

export class UpdateProjectDialogComponent implements OnInit {

  private oldName: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public project: DataSetProject, private dialogRef: MatDialogRef<UpdateProjectDialogComponent>, private dataSetService: DataSetService) { }
  
  ngOnInit(): void {
    this.oldName = this.project.name;
  }

  public updateProject(): void {
    if (!this.isValidInput()) return;
    this.dataSetService.updateDataSetProject(this.project).subscribe((res: DataSetProject) => this.dialogRef.close(res));
  }

  private isValidInput(): boolean {
    return this.project.name != '';
  }

  public close(): void {
    this.project.name = this.oldName;
    this.dialogRef.close();
  }
}

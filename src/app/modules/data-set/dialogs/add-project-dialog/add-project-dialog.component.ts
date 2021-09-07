import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataSetService } from '../../data-set.service';
import { DataSetProject } from '../../model/data-set-project/data-set-project.model';

@Component({
  selector: 'de-add-project-dialog',
  templateUrl: './add-project-dialog.component.html',
  styleUrls: ['./add-project-dialog.component.css']
})
export class AddProjectDialogComponent implements OnInit {

  public projects: DataSetProject[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) private dataSetId: number, private dataSetService: DataSetService, private dialogRef: MatDialogRef<AddProjectDialogComponent>) { }

  ngOnInit(): void {
    if (!this.dataSetId) {
      this.dialogRef.close();
    }
  }

  public addEmptyProject(): void {
    this.projects.push(new DataSetProject({name: '', url: ''}));
  }

  public addProjectsToDataSet(): void {
    if (this.isValidInput()) {
      this.dataSetService.addProjectsToDataSet(this.projects, this.dataSetId).subscribe(res => this.dialogRef.close(res));
    }
  }

  public deleteProject(index: number): void {
    this.projects.splice(index, 1);
  }

  private isValidInput(): boolean {
    if (this.projects.length == 0) {
      return false;
    }
    let indexOfEmptyProject = this.projects.findIndex(p => p.name.trim() == '' || p.url.trim() == '');
    return indexOfEmptyProject == -1;
  }
}

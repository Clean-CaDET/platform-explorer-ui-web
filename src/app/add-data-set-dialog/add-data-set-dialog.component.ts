import { Component, OnInit } from '@angular/core';

import { FormControl, Validators } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

import { RequestService } from '../../app/request.service'
import { MatDialogRef} from "@angular/material/dialog";

interface Project {
  name: string;
  url: string;
}

@Component({
  selector: 'app-add-data-set-dialog',
  templateUrl: './add-data-set-dialog.component.html',
  styleUrls: ['./add-data-set-dialog.component.css']
})

export class AddDataSetDialogComponent implements OnInit {

  projects: Project[] = [{name: '', url: ''}];

  constructor(private requestService: RequestService, private dialogRef: MatDialogRef<AddDataSetDialogComponent>) { }

  public addEmptyProject(){
    this.projects.push({name: '', url: ''});
  }

  public createDataSets(){
    if (this.isValidInput()) {
      let header = {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
      }
      this.requestService.sendRequest('POST', 'http://localhost:51834/api/dataset', this.projects, header.headers).subscribe(res => this.dialogRef.close(res));
    }
  }

  private isValidInput(): boolean {
    for (let project of this.projects){
      if (project.name.trim() == '' || project.url.trim() == '') {
        return false;
      }
    }
    return true;
  }

  ngOnInit(): void {
  }

}

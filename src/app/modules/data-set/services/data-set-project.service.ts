import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';


@Injectable({
  providedIn: 'root'
})
export class DataSetProjectService {

  private projectsPath: string = 'projects/';

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public async getProject(id: number): Promise<DataSetProject> {
    return await this.serverCommunicationService.getRequestAsync(this.projectsPath + id);
  }
  
  public updateDataSetProject(project: DataSetProject): Observable<DataSetProject> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest(this.projectsPath, project, headers);
  }

  public deleteDataSetProject(id: number): Observable<DataSetProject> {
    return this.serverCommunicationService.deleteRequest(this.projectsPath + id);
  }
}

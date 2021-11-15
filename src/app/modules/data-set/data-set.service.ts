import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DataSetProject } from './model/data-set-project/data-set-project.model';
import { DataSet } from './model/data-set/data-set.model';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { UtilService } from 'src/app/util/util.service';


@Injectable({
  providedIn: 'root'
})
export class DataSetService {

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public async getAllDataSets(): Promise<DataSet[]> {
    return await this.serverCommunicationService.getRequestAsync('dataset');
  }

  public createDataSet(name: string): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest('dataset', `"${name}"`, headers);
  }

  public addProjectsToDataSet(projects: DataSetProject[], dataSetId: number): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest('dataset/' + dataSetId + '/add-projects', projects, headers)
  }

  public async pollDataSetProject(id: number): Promise<DataSetProject> {
    return await this.serverCommunicationService.getRequestAsync('dataset/project/' + id);
  }

  public getDataSetCodeSmells(id: number): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest('dataset/' + id + '/code-smells');
  }

  public async exportDraftDataSet(id: number, exportPath: string): Promise<object> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {id: id, annotatorId: UtilService.getAnnotatorId(), exportPath: exportPath}
    return this.serverCommunicationService.postRequestAsync('dataset/export', data, headers);
  }
}

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DataSetProject } from './model/data-set-project/data-set-project.model';
import { DataSet } from './model/data-set/data-set.model';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { SmellFilter } from './model/smell-filter/smell-filter.model';
import { CodeSmell } from './model/code-smell/code-smell.model';



@Injectable({
  providedIn: 'root'
})
export class DataSetService {
  
  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public async getAllDataSets(): Promise<DataSet[]> {
    return await this.serverCommunicationService.getRequestAsync('dataset/');
  }

  public createDataSet(name: string, codeSmells: CodeSmell[]): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest('dataset/' + name, codeSmells, headers);
  }

  public addProjectToDataSet(project: DataSetProject, smellFilters: SmellFilter[], dataSetId: number): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {project: project, smellFilters: smellFilters};
    return this.serverCommunicationService.postRequest('dataset/' + dataSetId + '/add-project', data, headers)
  }

  public async pollDataSetProject(id: number): Promise<DataSetProject> {
    return await this.serverCommunicationService.getRequestAsync('dataset/project/' + id);
  }

  public getDataSetCodeSmells(id: number): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest('dataset/' + id + '/code-smells');
  }
  
  public exportDraftDataSet(id: number, exportPath: string): Observable<object> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {id: id, annotatorId: sessionStorage.getItem('annotatorId'), exportPath: exportPath}
    return this.serverCommunicationService.postRequest('dataset/export', data, headers);
  }
}

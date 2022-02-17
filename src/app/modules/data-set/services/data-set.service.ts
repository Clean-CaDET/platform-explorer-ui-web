import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataSet } from '../model/data-set/data-set.model';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { CodeSmell } from '../model/code-smell/code-smell.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { ProjectBuildSettings } from '../model/project-build-settings/project-build-settings.model';
import { SmellFilter } from '../model/smell-filter/smell-filter.model';
import { DatasetSummaryDTO } from '../model/DTOs/dataset-summary-dto/dataset-summary-dto.model';
import { DatasetDetailDTO } from '../model/DTOs/dataset-detail-dto/dataset-detail-dto.model';
import { SessionStorageService } from './shared/session-storage.service';


@Injectable({
  providedIn: 'root'
})
export class DataSetService {
  
  private datasetPath: string = 'dataset/';

  constructor(private serverCommunicationService: ServerCommunicationService, 
    private sessionService: SessionStorageService) { }

  public async getDataSet(id: number): Promise<DatasetDetailDTO> {
    return await this.serverCommunicationService.getRequestAsync(this.datasetPath + id);
  }

  public async getAllDataSets(): Promise<DatasetSummaryDTO[]> {
    return await this.serverCommunicationService.getRequestAsync(this.datasetPath);
  }

  public createDataSet(name: string, codeSmells: CodeSmell[]): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.datasetPath + name, codeSmells, headers);
  }
  
  public exportDraftDataSet(id: number, exportPath: string): Observable<object> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {id: id, annotatorId: this.sessionService.getLoggedInAnnotator(), exportPath: exportPath}
    return this.serverCommunicationService.postRequest(this.datasetPath + 'export', data, headers);
  }
  
  public deleteDataSet(id: number): Observable<DataSet> {
    return this.serverCommunicationService.deleteRequest(this.datasetPath + id);
  }

  public updateDataSet(dataSet: DataSet): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest(this.datasetPath, dataSet, headers);
  }
  
  public addProjectToDataSet(project: DataSetProject, smellFilters: SmellFilter[], buildSettings: ProjectBuildSettings, dataSetId: number): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {project: project, smellFilters: smellFilters, buildSettings: buildSettings};
    return this.serverCommunicationService.postRequest(this.datasetPath + dataSetId + '/projects', data, headers)
  }
  
  public getDataSetCodeSmells(id: number): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest(this.datasetPath + id + '/code-smells');
  }
}

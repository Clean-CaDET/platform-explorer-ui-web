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
import { LocalStorageService } from './shared/local-storage.service';
import { CodeSmellDefinition } from '../../annotation-schema/model/code-smell-definition/code-smell-definition.model';


@Injectable({
  providedIn: 'root'
})
export class DataSetService {
  
  private datasetsPath: string = 'datasets/';

  constructor(private serverCommunicationService: ServerCommunicationService, 
    private storageService: LocalStorageService) { }

  public async getDataSet(id: number): Promise<DatasetDetailDTO> {
    return await this.serverCommunicationService.getRequestAsync(this.datasetsPath + id);
  }

  public async getAllDataSets(): Promise<DatasetSummaryDTO[]> {
    return await this.serverCommunicationService.getRequestAsync(this.datasetsPath);
  }

  public createDataSet(name: string, codeSmells: CodeSmell[]): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.datasetsPath + name, codeSmells, headers);
  }
  
  public exportDraftDataSet(id: number, exportPath: string): Observable<object> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {id: id, annotatorId: this.storageService.getLoggedInAnnotator(), exportPath: exportPath}
    return this.serverCommunicationService.postRequest(this.datasetsPath + 'export', data, headers);
  }
  
  public deleteDataSet(id: number): Observable<DataSet> {
    return this.serverCommunicationService.deleteRequest(this.datasetsPath + id);
  }

  public updateDataSet(dataSet: DataSet): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest(this.datasetsPath, dataSet, headers);
  }
  
  public addProjectToDataSet(project: DataSetProject, smellFilters: SmellFilter[], buildSettings: ProjectBuildSettings, dataSetId: number): Observable<DataSet> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {project: project, smellFilters: smellFilters, buildSettings: buildSettings};
    return this.serverCommunicationService.postRequest(this.datasetsPath + dataSetId + '/projects', data, headers)
  }
  
  public getDataSetCodeSmells(id: number): Observable<CodeSmell[]> {
    return this.serverCommunicationService.getRequest(this.datasetsPath + id + '/code-smells');
  }
}

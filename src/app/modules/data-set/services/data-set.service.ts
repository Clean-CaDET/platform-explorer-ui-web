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
import { CleanCodeAnalysisDTO } from '../model/DTOs/clean-code-analysis-export-dto/clean-code-analysis-export-dto.model';

@Injectable({
  providedIn: 'root',
})
export class DataSetService {
  private datasetsPath: string = 'datasets/';

  constructor(
    private serverCommunicationService: ServerCommunicationService,
    private storageService: LocalStorageService
  ) {}

  public async getDataSet(id: number): Promise<DatasetDetailDTO> {
    return await this.serverCommunicationService.getRequestAsync(this.datasetsPath + id);
  }

  public async getAllDataSets(): Promise<DatasetSummaryDTO[]> {
    return await this.serverCommunicationService.getRequestAsync(this.datasetsPath);
  }

  public createDataSet(name: string, codeSmells: CodeSmell[]): Observable<DataSet> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.datasetsPath + name, codeSmells, headers);
  }

  public exportDraftDataSet(id: number): Observable<object> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    let data = { id: id, annotatorId: this.storageService.getLoggedInAnnotator() };
    return this.serverCommunicationService.postRequest(this.datasetsPath + 'export-draft', data, headers);
  }

  public exportCompleteDataSet(datasetId: number, formData: FormData): Observable<object> {
    let headers = new HttpHeaders();
    return this.serverCommunicationService.postRequest(this.datasetsPath + datasetId + '/export-complete', formData, headers);
  }

  public cleanCodeAnalysis(datasetId: number, exportDTO: CleanCodeAnalysisDTO): Observable<object> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.datasetsPath + datasetId + '/export-clean-code-analysis', exportDTO, headers);
  }

  public deleteDataSet(id: number): Observable<DataSet> {
    return this.serverCommunicationService.deleteRequest(this.datasetsPath + id);
  }

  public updateDataSet(dataSet: DataSet): Observable<DataSet> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest(this.datasetsPath, dataSet, headers);
  }
  
  public addProjectToDataSet(project: DataSetProject, smellFilters: SmellFilter[], buildSettings: ProjectBuildSettings, dataSetId: number): Observable<DataSetProject> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {project: project, smellFilters: smellFilters, buildSettings: buildSettings};
    return this.serverCommunicationService.postRequest(this.datasetsPath + dataSetId + '/projects', data, headers)
  }

  public addMultipleProjectsToDataSet(filePath: string, dataSetId: number, smellFilters: SmellFilter[]) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let data = {filePath: filePath, smellFilters: smellFilters};
    return this.serverCommunicationService.postRequest(this.datasetsPath + dataSetId + '/multipleProjects', data, headers)
  }

  public importProjectsToDataSet(dataSetId: number, file: File, smellFilters: SmellFilter[]) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('smellFilters', JSON.stringify(smellFilters));
    let headers = new HttpHeaders();
    return this.serverCommunicationService.postRequest(this.datasetsPath + dataSetId + '/importProjects', formData, headers)
  }
  
  public getDataSetCodeSmells(id: number): Observable<CodeSmell[]> {
    return this.serverCommunicationService.getRequest(this.datasetsPath + id + '/code-smells');
  }
}

import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { DataSetAnnotationDTO } from '../model/DTOs/data-set-annotation-dto/data-set-annotation-dto.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model'; 
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';
import { CodeSmellDTO } from '../model/DTOs/code-smell-dto/code-smell-dto.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAllCodeSmells(): Observable<CodeSmellDTO[]> {
    return this.serverCommunicationService.getRequest('annotation/code-smells');
  }

  public addAnnotation(annotation: DataSetAnnotationDTO): Observable<DataSetAnnotation> {
    let annotatorID = sessionStorage.getItem('annotatorID')
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', annotatorID ? annotatorID! : '0')
    return this.serverCommunicationService.postRequest('annotation', annotation, headers);
  }

  public updateAnnotation(annotationId: number, annotation: DataSetAnnotationDTO): Observable<DataSetAnnotation> {
    let annotatorID = sessionStorage.getItem('annotatorID')
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', annotatorID ? annotatorID! : '0')
    return this.serverCommunicationService.putRequest('annotation/update/' + annotationId, annotation, headers);
  }

  public async requiringAdditionalAnnotation(projects: DataSetProject[]): Promise<DataSetInstance[]> {
    let ids = this.getProjectIdsAsString(projects);
    if (ids != '') {
      return await this.serverCommunicationService.getRequestAsync('annotation/requiring-additional-annotation?projectIds=' + ids);
    }
    return [];
  }

  public async disagreeingAnnotations(projects: DataSetProject[]): Promise<DataSetInstance[]> {
    let ids = this.getProjectIdsAsString(projects);
    if (ids != '') {
      return await this.serverCommunicationService.getRequestAsync('annotation/disagreeing-annotations?projectIds=' + ids);
    }
    return [];
  }

  private getProjectIdsAsString(projects: DataSetProject[]): string {
    let projectIds = '';
    for (let project of projects) {
      projectIds += project.id + ',';
    }
    return projectIds.substring(0, projectIds.length - 1);
  }
}

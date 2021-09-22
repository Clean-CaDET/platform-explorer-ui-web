import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataSetAnnotationDTO } from '../model/DTOs/data-set-annotation-dto/data-set-annotation-dto.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model'; 
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { UtilService } from 'src/app/util/util.service';
import { CandidateDataSetInstance } from '../model/candidate-data-set-instance/candidate-data-set-instance.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAvailableCodeSmells(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest('annotation/available-code-smells');
  }

  public getAvailableHeuristics(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest('annotation/available-heuristics');
  }

  public addAnnotation(annotation: DataSetAnnotationDTO): Observable<DataSetAnnotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', UtilService.getAnnotatorId().toString());
    return this.serverCommunicationService.postRequest('annotation', annotation, headers);
  }

  public updateAnnotation(annotationId: number, annotation: DataSetAnnotationDTO): Observable<DataSetAnnotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', UtilService.getAnnotatorId().toString());
    return this.serverCommunicationService.putRequest('annotation/update/' + annotationId, annotation, headers);
  }

  public async requiringAdditionalAnnotation(projects: DataSetProject[]): Promise<CandidateDataSetInstance[]> {
    let ids = this.getProjectIdsAsString(projects);
    if (ids != '') {
      return await this.serverCommunicationService.getRequestAsync('annotation/requiring-additional-annotation?projectIds=' + ids);
    }
    return [];
  }

  public async disagreeingAnnotations(projects: DataSetProject[]): Promise<CandidateDataSetInstance[]> {
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

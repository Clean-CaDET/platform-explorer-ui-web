import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataSetAnnotationDTO } from '../model/DTOs/data-set-annotation-dto/data-set-annotation-dto.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model'; 
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { UtilService } from 'src/app/util/util.service';

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
      .set('Authorization', UtilService.getAnnotatorId().toString())
    return this.serverCommunicationService.postRequest('annotation', annotation, headers);
  }

  public updateAnnotation(annotationId: number, annotation: DataSetAnnotationDTO): Observable<DataSetAnnotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', UtilService.getAnnotatorId().toString())
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

  public getAnnotationConsistencyForAnnotator(projectId: number, annotatorId: number): Observable<Map<string, string>> {
    return this.serverCommunicationService.getRequest('annotation/consistency/annotator/' + projectId + '/' + annotatorId);
  }

  public getAnnotationConsistencyBetweenAnnotatorsForSeverity(projectId: number, severity: number): Observable<Map<string, string>> {
    return this.serverCommunicationService.getRequest('annotation/consistency/annotators/' + projectId + '/' + severity);
  }

  public getMetricsSignificanceInAnnotationsForAnnotator(projectId: number, annotatorId: number): any {
    return this.serverCommunicationService.getRequest('annotation/consistency/metrics/annotator/' + projectId + '/' + annotatorId);
  }

  public getMetricsSignificanceBetweenAnnotatorsForSeverity(projectId: number, severity: number): any {
    return this.serverCommunicationService.getRequest('annotation/consistency/metrics/annotators/' + projectId + '/' + severity);
  }

  private getProjectIdsAsString(projects: DataSetProject[]): string {
    let projectIds = '';
    for (let project of projects) {
      projectIds += project.id + ',';
    }
    return projectIds.substring(0, projectIds.length - 1);
  }
}

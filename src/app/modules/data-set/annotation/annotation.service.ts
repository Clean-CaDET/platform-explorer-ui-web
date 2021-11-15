import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AnnotationDTO } from '../model/DTOs/annotation-dto/annotation-dto.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { Annotation } from '../model/annotation/annotation.model';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAvailableCodeSmells(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest('annotation/available-code-smells');
  }

  public getAvailableMetrics(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest('annotation/available-metrics');
  }

  public getAvailableHeuristics(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest('annotation/available-heuristics');
  }

  public addAnnotation(annotation: AnnotationDTO): Observable<Annotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', AnnotationService.getLoggedInAnnotatorId().toString());
    return this.serverCommunicationService.postRequest('annotation', annotation, headers);
  }

  public updateAnnotation(annotationId: number, annotation: AnnotationDTO): Observable<Annotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', AnnotationService.getLoggedInAnnotatorId().toString());
    return this.serverCommunicationService.putRequest('annotation/update/' + annotationId, annotation, headers);
  }

  public async requiringAdditionalAnnotation(projects: DataSetProject[]): Promise<SmellCandidateInstances[]> {
    let ids = this.getProjectIdsAsString(projects);
    if (ids != '') {
      return await this.serverCommunicationService.getRequestAsync('annotation/requiring-additional-annotation?projectIds=' + ids);
    }
    return [];
  }

  public async disagreeingAnnotations(projects: DataSetProject[]): Promise<SmellCandidateInstances[]> {
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

  public static getLoggedInAnnotatorId(): number {
    let annotatorId = sessionStorage.getItem('annotatorId');
    return annotatorId ? +annotatorId! : 0;
  }
}

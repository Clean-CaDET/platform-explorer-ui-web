import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public addAnnotation(annotation: DataSetAnnotation): Observable<any> {
    let annotatorID = sessionStorage.getItem('annotatorID')
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', annotatorID ? annotatorID! : "0")
    return this.serverCommunicationService.postRequest('annotation', annotation, headers);
  }

  public async requiringAdditionalAnnotation(projects: DataSetProject[]): Promise<any> {
    let ids = this.getProjectIdsAsString(projects);
    if (ids != '') {
      return await this.serverCommunicationService.getRequestAsync('annotation/requiring-additional-annotation?projectIds=' + ids);
    }
    return [];
  }

  public async disagreeingAnnotations(projects: DataSetProject[]): Promise<any> {
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

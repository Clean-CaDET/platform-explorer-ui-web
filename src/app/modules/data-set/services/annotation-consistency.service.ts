import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationConsistencyService {

  private consistencyPath: string = 'annotation-consistency/';

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAnnotationConsistencyForAnnotator(projectId: number, annotatorId: number): Observable<Map<string, string>> {
    return this.serverCommunicationService.getRequest(this.consistencyPath + 'annotator/' + projectId + '/' + annotatorId);
  }

  public getAnnotationConsistencyBetweenAnnotatorsForSeverity(projectId: number, severity: string): Observable<Map<string, string>> {
    return this.serverCommunicationService.getRequest(this.consistencyPath + 'annotators/' + projectId + '/' + severity);
  }

  public getMetricsSignificanceInAnnotationsForAnnotator(projectId: number, annotatorId: number): Observable<Map<string, Map<string, string>>> {
    return this.serverCommunicationService.getRequest(this.consistencyPath + 'metrics/annotator/' + projectId + '/' + annotatorId);
  }

  public getMetricsSignificanceBetweenAnnotatorsForSeverity(projectId: number, severity: string): Observable<Map<string, Map<string, string>>> {
    return this.serverCommunicationService.getRequest(this.consistencyPath + 'metrics/annotators/' + projectId + '/' + severity);
  }
}

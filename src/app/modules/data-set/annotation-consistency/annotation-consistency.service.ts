import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationConsistencyService {

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAnnotationConsistencyForAnnotator(projectId: number, annotatorId: number): Observable<Map<string, string>> {
    return this.serverCommunicationService.getRequest('annotation/consistency/annotator/' + projectId + '/' + annotatorId);
  }

  public getAnnotationConsistencyBetweenAnnotatorsForSeverity(projectId: number, severity: number): Observable<Map<string, string>> {
    return this.serverCommunicationService.getRequest('annotation/consistency/annotators/' + projectId + '/' + severity);
  }

  public getMetricsSignificanceInAnnotationsForAnnotator(projectId: number, annotatorId: number): Observable<Map<string, Map<string, string>>> {
    return this.serverCommunicationService.getRequest('annotation/consistency/metrics/annotator/' + projectId + '/' + annotatorId);
  }

  public getMetricsSignificanceBetweenAnnotatorsForSeverity(projectId: number, severity: number): Observable<Map<string, Map<string, string>>> {
    return this.serverCommunicationService.getRequest('annotation/consistency/metrics/annotators/' + projectId + '/' + severity);
  }
}

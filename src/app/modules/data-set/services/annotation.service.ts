import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Annotation } from '../model/annotation/annotation.model';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';
import { AnnotationDTO } from '../model/DTOs/annotation-dto/annotation-dto.model';
import { Instance } from '../model/instance/instance.model';
import { LocalStorageService } from './shared/local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private serverCommunicationService: ServerCommunicationService, 
    private storageService: LocalStorageService) { }

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
      .set('Authorization', this.storageService.getLoggedInAnnotator()!);
    return this.serverCommunicationService.postRequest('annotation', annotation, headers);
  }

  public updateAnnotation(annotationId: number, annotation: AnnotationDTO): Observable<Annotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this.storageService.getLoggedInAnnotator()!);
    return this.serverCommunicationService.putRequest('annotation/update/' + annotationId, annotation, headers);
  }

  public async requiringAdditionalAnnotation(id: number): Promise<SmellCandidateInstances[]> {
    return await this.serverCommunicationService.getRequestAsync('annotation/requiring-additional-annotation/' + id);
  }

  public async disagreeingAnnotations(id: number): Promise<SmellCandidateInstances[]> {
      return await this.serverCommunicationService.getRequestAsync('annotation/disagreeing-annotations/' + id);
  }

  public async getInstanceWithRelatedInstances(id: number): Promise<Instance> {
    return await this.serverCommunicationService.getRequestAsync('annotation/instances/' + id);
  }

  public async getInstanceWithAnnotations(id: number): Promise<Instance> {
    return await this.serverCommunicationService.getRequestAsync('instances/' + id + '/annotations');
  }
}

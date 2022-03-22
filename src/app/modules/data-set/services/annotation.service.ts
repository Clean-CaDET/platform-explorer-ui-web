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

  private annotationsPath: string = 'annotations/';

  constructor(private serverCommunicationService: ServerCommunicationService, 
    private storageService: LocalStorageService) { }

  public getAvailableCodeSmells(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest(this.annotationsPath + 'available-code-smells');
  }

  public getAvailableMetrics(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest(this.annotationsPath + 'available-metrics');
  }

  public getAvailableHeuristics(): Observable<Map<string, string[]>> {
    return this.serverCommunicationService.getRequest(this.annotationsPath + 'available-heuristics');
  }

  public addAnnotation(annotation: AnnotationDTO): Observable<Annotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this.storageService.getLoggedInAnnotator()!);
    return this.serverCommunicationService.postRequest(this.annotationsPath, annotation, headers);
  }

  public updateAnnotation(annotationId: number, annotation: AnnotationDTO): Observable<Annotation> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this.storageService.getLoggedInAnnotator()!);
    return this.serverCommunicationService.putRequest(this.annotationsPath + 'update/' + annotationId, annotation, headers);
  }

  public async requiringAdditionalAnnotation(id: number): Promise<SmellCandidateInstances[]> {
    return await this.serverCommunicationService.getRequestAsync(this.annotationsPath + 'requiring-additional-annotation/' + id);
  }

  public async disagreeingAnnotations(id: number): Promise<SmellCandidateInstances[]> {
      return await this.serverCommunicationService.getRequestAsync(this.annotationsPath + 'disagreeing-annotations/' + id);
  }
}

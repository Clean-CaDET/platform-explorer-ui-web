import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public addAnnotation(annotation: DataSetAnnotation): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', sessionStorage.getItem('annotatorID')!)
    return this.serverCommunicationService.postRequest('annotation', annotation, headers);
  }
}

import { Injectable, EventEmitter } from '@angular/core';
import { Annotation } from '../model/annotation/annotation.model';


@Injectable({
  providedIn: 'root'
})
export class AnnotationNotificationService {

  public newAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  public changedAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();

  constructor() { }

}

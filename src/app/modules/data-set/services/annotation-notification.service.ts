import { Injectable, EventEmitter } from '@angular/core';
import { Annotation } from '../model/annotation/annotation.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { DataSet } from '../model/data-set/data-set.model';
import { Instance } from '../model/instance/instance.model';


@Injectable({
  providedIn: 'root'
})
export class AnnotationNotificationService {

  public newAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  public changedAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  public datasetChosen: EventEmitter<DataSet> = new EventEmitter<DataSet>();
  public projectChosen: EventEmitter<DataSetProject> = new EventEmitter<DataSetProject>();
  public instanceChosen: EventEmitter<Instance> = new EventEmitter<Instance>();
  public annotationCounter: EventEmitter<any> = new EventEmitter();

  constructor() { }

}

import { Injectable, EventEmitter } from '@angular/core';
import { Annotation } from '../../model/annotation/annotation.model';
import { DataSet } from '../../model/data-set/data-set.model';
import { Instance } from '../../model/instance/instance.model';


@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  public newAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  public changedAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  public datasetChosen: EventEmitter<DataSet> = new EventEmitter<DataSet>();
  public projectChosen: EventEmitter<any> = new EventEmitter<any>();
  public instanceChosen: EventEmitter<Instance> = new EventEmitter<Instance>();
  public nextInstance: EventEmitter<number> = new EventEmitter<number>();
  public previousInstance: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

}

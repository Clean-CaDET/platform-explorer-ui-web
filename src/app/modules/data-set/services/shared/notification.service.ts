import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Annotation } from '../../model/annotation/annotation.model';
import { DataSet } from '../../model/data-set/data-set.model';
import { Instance } from '../../model/instance/instance.model';


@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  private eventTracker = new BehaviorSubject<NotificationEvent>(new NotificationEvent());
  getEvent(): BehaviorSubject<NotificationEvent> { return this.eventTracker; }
  setEvent(event: NotificationEvent): void { this.eventTracker.next(event); }

  constructor() { }

}

export class NotificationEvent {
  public getType(): any {
    return this.getType();
  }
}

export class NewAnnotationEvent extends NotificationEvent {
   constructor(
      public annotation: Annotation
   ) {
     super();
   }
}

export class ChangedAnnotationEvent extends NotificationEvent {
   constructor(
      public annotation: Annotation
   ) {
    super();
   }
}

export class DatasetChosenEvent extends NotificationEvent {
  constructor(
     public dataset: DataSet
  ) {
   super();
  }
}

export class ProjectChosenEvent extends NotificationEvent {
  constructor(
     public data: any
  ) {
   super();
  }
}

export class InstanceChosenEvent extends NotificationEvent {
  constructor(
     public instance: Instance
  ) {
   super();
  }
}

export class NextInstanceEvent extends NotificationEvent {
  constructor(
     public currentInstanceId: number
  ) {
   super();
  }
}

export class PreviousInstanceEvent extends NotificationEvent {
  constructor(
     public currentInstanceId: number
  ) {
   super();
  }
}

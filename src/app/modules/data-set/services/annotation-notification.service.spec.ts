import { TestBed } from '@angular/core/testing';
import { AnnotationNotificationService } from './annotation-notification.service';


describe('AnnotationNotificationService', () => {
  let service: AnnotationNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

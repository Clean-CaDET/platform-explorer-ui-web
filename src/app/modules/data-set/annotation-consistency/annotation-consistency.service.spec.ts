import { TestBed } from '@angular/core/testing';

import { AnnotationConsistencyService } from './annotation-consistency.service';

describe('AnnotationConsistencyService', () => {
  let service: AnnotationConsistencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationConsistencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

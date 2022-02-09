import { TestBed } from '@angular/core/testing';
import { DataSetProjectService } from './data-set-project.service';


describe('DataSetProjectService', () => {
  let service: DataSetProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSetProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationConsistencyDialogComponent } from './annotation-consistency-dialog.component';

describe('AnnotationConsistencyDialogComponent', () => {
  let component: AnnotationConsistencyDialogComponent;
  let fixture: ComponentFixture<AnnotationConsistencyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationConsistencyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationConsistencyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

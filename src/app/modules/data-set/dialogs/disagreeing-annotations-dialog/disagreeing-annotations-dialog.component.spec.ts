import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisagreeingAnnotationsDialogComponent } from './disagreeing-annotations-dialog.component';

describe('DisagreeingAnnotationsDialogComponent', () => {
  let component: DisagreeingAnnotationsDialogComponent;
  let fixture: ComponentFixture<DisagreeingAnnotationsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisagreeingAnnotationsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisagreeingAnnotationsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

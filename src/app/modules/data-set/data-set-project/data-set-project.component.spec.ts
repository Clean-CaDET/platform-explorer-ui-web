import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSetProjectComponent } from './data-set-project.component';

describe('DataSetProjectComponent', () => {
  let component: DataSetProjectComponent;
  let fixture: ComponentFixture<DataSetProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSetProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSetProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

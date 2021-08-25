import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSetInstanceComponent } from './data-set-instance.component';

describe('DataSetInstanceComponent', () => {
  let component: DataSetInstanceComponent;
  let fixture: ComponentFixture<DataSetInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSetInstanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSetInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

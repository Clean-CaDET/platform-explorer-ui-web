import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataSetDetailComponent } from './data-set-detail.component';


describe('DataSetDetailComponent', () => {
  let component: DataSetDetailComponent;
  let fixture: ComponentFixture<DataSetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSetDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

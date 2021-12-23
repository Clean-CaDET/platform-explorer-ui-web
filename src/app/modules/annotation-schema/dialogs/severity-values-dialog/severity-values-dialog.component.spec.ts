import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeverityValuesDialogComponent } from './severity-values-dialog.component';


describe('SeverityValuesDialogComponent', () => {
  let component: SeverityValuesDialogComponent;
  let fixture: ComponentFixture<SeverityValuesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeverityValuesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeverityValuesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

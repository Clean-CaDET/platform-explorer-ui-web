import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeverityRangeDialogComponent } from './severity-range-dialog.component';

describe('SeverityRangeDialogComponent', () => {
  let component: SeverityRangeDialogComponent;
  let fixture: ComponentFixture<SeverityRangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeverityRangeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeverityRangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

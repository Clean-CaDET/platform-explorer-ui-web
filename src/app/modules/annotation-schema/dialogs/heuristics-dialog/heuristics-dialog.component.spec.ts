import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeuristicsDialogComponent } from './heuristics-dialog.component';

describe('HeuristicsDialogComponent', () => {
  let component: HeuristicsDialogComponent;
  let fixture: ComponentFixture<HeuristicsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeuristicsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeuristicsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

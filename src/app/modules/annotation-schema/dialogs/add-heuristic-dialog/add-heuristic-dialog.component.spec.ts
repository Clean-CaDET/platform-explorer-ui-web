import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddHeuristicDialogComponent } from './add-heuristic-dialog.component';

describe('AddHeuristicDialogComponent', () => {
  let component: AddHeuristicDialogComponent;
  let fixture: ComponentFixture<AddHeuristicDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddHeuristicDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHeuristicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateHeuristicDialogComponent } from './update-heuristic-dialog.component';

describe('UpdateHeuristicDialogComponent', () => {
  let component: UpdateHeuristicDialogComponent;
  let fixture: ComponentFixture<UpdateHeuristicDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateHeuristicDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateHeuristicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

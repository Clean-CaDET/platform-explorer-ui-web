import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateCodeSmellDialogComponent } from './update-code-smell-dialog.component';

describe('UpdateCodeSmellDialogComponent', () => {
  let component: UpdateCodeSmellDialogComponent;
  let fixture: ComponentFixture<UpdateCodeSmellDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCodeSmellDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCodeSmellDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCodeSmellDialogComponent } from './add-code-smell-dialog.component';

describe('AddCodeSmellDialogComponent', () => {
  let component: AddCodeSmellDialogComponent;
  let fixture: ComponentFixture<AddCodeSmellDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCodeSmellDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCodeSmellDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

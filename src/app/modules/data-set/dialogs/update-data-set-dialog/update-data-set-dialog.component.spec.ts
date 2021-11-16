import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateDataSetDialogComponent } from './update-data-set-dialog.component';


describe('UpdateDataSetDialogComponent', () => {
  let component: UpdateDataSetDialogComponent;
  let fixture: ComponentFixture<UpdateDataSetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDataSetDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDataSetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

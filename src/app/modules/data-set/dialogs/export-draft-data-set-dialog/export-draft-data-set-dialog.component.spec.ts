import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportDraftDataSetDialogComponent } from './export-draft-data-set-dialog.component';


describe('ExportDraftDataSetDialogComponent', () => {
  let component: ExportDraftDataSetDialogComponent;
  let fixture: ComponentFixture<ExportDraftDataSetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportDraftDataSetDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDraftDataSetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

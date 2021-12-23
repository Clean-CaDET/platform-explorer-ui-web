import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationSchemaComponent } from './annotation-schema.component';

describe('AnnotationSchemaComponent', () => {
  let component: AnnotationSchemaComponent;
  let fixture: ComponentFixture<AnnotationSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationSchemaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

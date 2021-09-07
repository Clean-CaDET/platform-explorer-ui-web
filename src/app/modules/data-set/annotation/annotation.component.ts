import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';
import { DataSetAnnotationDTO } from '../model/DTOs/data-set-annotation-dto/data-set-annotation-dto.model';
import { InstanceType } from '../model/enums/enums.model';
import { SmellHeuristic } from '../model/smell-heuristic/smell-heuristic.model';

import { AnnotationService } from './annotation.service';

@Component({
  selector: 'de-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class AnnotationComponent implements OnInit {

  @Input() public instanceId: number = 0;
  @Input() public instanceType: InstanceType = InstanceType.Method;
  @Input() public previousAnnotation: DataSetAnnotation | null = null;
  @Input() public disableEdit: boolean = false;

  public severityFormControl = new FormControl('0', [
    Validators.required,
    Validators.min(0),
    Validators.max(3),
  ]);
  public codeSmell: string = '';
  public heuristics = new FormControl();

  private availableCodeSmells: Map<InstanceType, string[]> = new Map();
  private availableHeuristics: Map<InstanceType, string[]> = new Map();

  public applicableHeuristics: Map<string, string> = new Map();
  public annotatorId: string = '';
  private isHeuristicReasonChanged: boolean = false;

  @Output() newAnnotation = new EventEmitter<DataSetAnnotation>();
  @Output() changedAnnotation = new EventEmitter<DataSetAnnotation>();

  constructor(private annotationService: AnnotationService, private changeDetector: ChangeDetectorRef) { }

  public ngOnInit(): void {
    this.annotatorId = this.previousAnnotation?.annotator.id + '';
    if (!this.disableEdit) {
      this.annotationService.getAvailableCodeSmells().subscribe(res => this.initSmellsOrHeuristics(res, this.availableCodeSmells));
      this.annotationService.getAvailableHeuristics().subscribe(res => this.initSmellsOrHeuristics(res, this.availableHeuristics));
    } else if (this.previousAnnotation) {
      this.availableCodeSmells.set(this.instanceType, [this.previousAnnotation.instanceSmell.name]);
      let previousHeristics = this.previousAnnotation.applicableHeuristics.map(h => h.description);
      this.availableHeuristics.set(this.instanceType, previousHeristics);
    }
  }

  public ngOnChanges(): void {
    this.severityFormControl.setValue(0);
    if (this.disableEdit) {
      this.severityFormControl.disable();
      this.heuristics.disable();
    }
    this.codeSmell = '';
    this.heuristics.setValue([]);
    this.applicableHeuristics = new Map();
    this.setupInputFromPreviousAnnotation();
  }

  public ngAfterViewChecked(): void {
    if (this.isHeuristicReasonChanged) {
      for (let description of this.applicableHeuristics.keys()) {
        let reasonInput = document.getElementById('reason-' + description + '-' + this.annotatorId) as HTMLInputElement;
        if (reasonInput) {
          reasonInput.value = this.applicableHeuristics.get(description)!;
        }
      }
      this.changeDetector.detectChanges();
      this.isHeuristicReasonChanged = false;
    }
  }

  public addReasonForHeuristic(target: EventTarget, heuristic: string): void {
    this.applicableHeuristics.set(heuristic, (target as HTMLInputElement).value);
    this.isHeuristicReasonChanged = true;
  }

  public getAvailableCodeSmells(): string[] {
    return this.availableCodeSmells.get(this.instanceType)!;
  }

  public getAvailableHeuristics(): string[] {
    return this.availableHeuristics.get(this.instanceType)!;
  }

  public annotate(): void {
    if (!this.isValidInput()) {
      this.showErrorInputMessage();
      return;
    }
    let annotation = this.getAnnotationFromInput();
    if (this.previousAnnotation) {
      this.updateAnnotation(annotation);
      return;
    }
    this.addAnnotation(annotation);
  }

  private initSmellsOrHeuristics(input: Map<string, string[]>, smellsOrHeuristics: Map<InstanceType, string[]>): void {
    for (let keyValue of Object.entries(input)) {
      smellsOrHeuristics.set(keyValue[0] as InstanceType, keyValue[1]);
    }
  }

  private addAnnotation(annotation: DataSetAnnotationDTO): void {
    this.annotationService.addAnnotation(annotation).subscribe(
      (res: DataSetAnnotation) => {
        alert('Annotation added!');
        this.newAnnotation.emit(new DataSetAnnotation(res));
      },
      error => alert('ERROR:\n' + error.error.message)
    );
  }

  private updateAnnotation(annotation: DataSetAnnotationDTO): void {
    this.annotationService.updateAnnotation(this.previousAnnotation!.id, annotation).subscribe(
      (res: DataSetAnnotation) => {
        alert('Annotation changed!');
        this.changedAnnotation.emit(new DataSetAnnotation(res));
      },
      error => alert('ERROR:\n' + error.error.message)
    );
  }

  private getAnnotationFromInput(): DataSetAnnotationDTO {
    return new DataSetAnnotationDTO({
      dataSetInstanceId: this.instanceId,
      severity: this.severityFormControl.value,
      codeSmell: this.codeSmell,
      applicableHeuristics: this.getHeuristicsFromInput()
    });
  }

  private getHeuristicsFromInput(): SmellHeuristic[] {
    let ret: SmellHeuristic[] = [];
    for (let selectedHeuristic of this.heuristics.value) {
      ret.push(new SmellHeuristic({
        description: selectedHeuristic,
        isApplicable: true,
        reasonForApplicability: this.applicableHeuristics.get(selectedHeuristic)
      }));
    }
    return ret;
  }

  private setupInputFromPreviousAnnotation(): void {
    if (this.previousAnnotation) {
      this.severityFormControl.setValue(this.previousAnnotation.severity);
      this.codeSmell = this.previousAnnotation.instanceSmell.name;
      let previousHeuristics: string[] = []
      this.previousAnnotation.applicableHeuristics.forEach( h => {
        previousHeuristics.push(h.description);
        this.applicableHeuristics.set(h.description, h.reasonForApplicability);
      });
      this.heuristics.setValue(previousHeuristics);
      this.isHeuristicReasonChanged = true;
    }
  }

  private isValidInput(): boolean {
    return this.severityFormControl.valid 
      && this.codeSmell != '' 
      && !(this.heuristics.value.length == 0 && this.severityFormControl.value > 0);
  }

  private showErrorInputMessage(): void {
    let message = 'Invalid input:';
    if (!this.severityFormControl.valid) {
      message += '\n- Severity must be between 0 and 3';
    }
    if (!this.codeSmell) {
      message += '\n- Must enter a code smell'
    }
    if (this.heuristics.value.length == 0 && this.severityFormControl.value > 0) {
      message += '\n- For severity greater than 0 you must add heuristic'
    }
    alert(message);
  }

}

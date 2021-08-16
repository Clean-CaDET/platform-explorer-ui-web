import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';
import { DataSetAnnotationDTO } from '../model/DTOs/data-set-annotation-dto/data-set-annotation-dto.model';
import { SmellHeuristic } from '../model/smell-heuristic/smell-heuristic.model';

import { AnnotationService } from './annotation.service';

@Component({
  selector: 'de-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class AnnotationComponent implements OnInit {

  @Input() public instanceId: number = 0;
  @Input() public instanceType: number = 0;
  @Input() public previousAnnotation: DataSetAnnotation | null = null;
  public severityFormControl = new FormControl('0', [
    Validators.required,
    Validators.min(0),
    Validators.max(3),
  ]);
  public codeSmell: string = '';
  public heuristics = new FormControl();

  private availableCodeSmells: Map<number, string[]> = new Map([
    [0, ['Large Class']],
    [1, ['Long Method']]
  ]);

  private availableHeuristicsForClass = ['Class is too long.', 'Class is too complex.', 'Class has multiple concerns.'];
  private availableHeuristicsForMethod = ['Function is too long.', 'Function is too complex.', 'Function does multiple things.'];
  private availableHeuristics: Map<number, string[]> = new Map([
    [0, this.availableHeuristicsForClass],
    [1, this.availableHeuristicsForMethod]
  ]);

  public applicableHeuristics: Map<string, string> = new Map([]);

  constructor(private annotationService: AnnotationService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.severityFormControl.setValue(0);
    this.codeSmell = '';
    this.heuristics.setValue([]);
    this.resetApplicableHeuristics();
    this.setupInputFromPreviousAnnotation();
  }

  ngAfterViewChecked(): void {
    for (let description of this.applicableHeuristics.keys()) {
      let input = document.getElementById('reason-' + description) as HTMLInputElement;
      if (input) {
        input.value = this.applicableHeuristics.get(description)!;
      }
    }
    this.changeDetector.detectChanges();
  }

  public addReasonForHeuristic(target: EventTarget, heuristic: string) {
    this.applicableHeuristics.set(heuristic, (target as HTMLInputElement).value);
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
      this.annotationService.updateAnnotation(this.previousAnnotation.id, annotation).subscribe(res => alert(res.message), error => alert("ERROR:\n" + error.error.message));
      return;
    }
    this.annotationService.addAnnotation(annotation).subscribe(res => alert(res.message), error => alert("ERROR:\n" + error.error.message));
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

  private resetApplicableHeuristics(): void {
    for (let classHeuristic of this.availableHeuristicsForClass){
      this.applicableHeuristics.set(classHeuristic, '');
    }
    
    for (let methodHeuristic of this.availableHeuristicsForMethod){
      this.applicableHeuristics.set(methodHeuristic, '');
    }
  }

  private setupInputFromPreviousAnnotation(): void {
    if (this.previousAnnotation) {
      this.severityFormControl.setValue(this.previousAnnotation.severity);
      this.codeSmell = this.previousAnnotation.instanceSmell.value;
      let previousHeuristics: string[] = []
      this.previousAnnotation.applicableHeuristics.forEach( h => {
        previousHeuristics.push(h.description)
        this.applicableHeuristics.set(h.description, h.reasonForApplicability);
      });
      this.heuristics.setValue(previousHeuristics);
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

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';
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

  constructor(private annotationService: AnnotationService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.severityFormControl.setValue(0);
    this.codeSmell = '';
    this.heuristics.setValue([]);
    this.resetApplicableHeuristics();
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

  public annotate() {
    if (this.isValid()) {
      this.annotationService.addAnnotation(this.getAnnotationFromInput()).subscribe(res => alert(res.message));
    }
  }

  private getAnnotationFromInput(): DataSetAnnotation {
    return new DataSetAnnotation({
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

  private resetApplicableHeuristics() {
    for (let classHeuristic of this.availableHeuristicsForClass){
      this.applicableHeuristics.set(classHeuristic, '');
    }
    
    for (let methodHeuristic of this.availableHeuristicsForMethod){
      this.applicableHeuristics.set(methodHeuristic, '');
    }
  }

  private isValid(): boolean {
    return this.severityFormControl.valid && this.codeSmell != '' && this.heuristics.value.length != 0;
  }

}

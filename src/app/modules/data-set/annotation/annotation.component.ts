import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Annotation } from '../model/annotation/annotation.model';
import { AnnotationDTO } from '../model/DTOs/annotation-dto/annotation-dto.model';
import { SmellHeuristic } from '../model/smell-heuristic/smell-heuristic.model';

import { AnnotationService } from './annotation.service';

@Component({
  selector: 'de-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class AnnotationComponent implements OnInit {

  @Input() public codeSmell: string = '';
  @Input() public instanceId: number = 0;
  @Input() public previousAnnotation: Annotation | null = null;
  @Input() public disableEdit: boolean = false;

  public severityFormControl: FormControl = new FormControl('0', [
    Validators.required,
    Validators.min(0),
    Validators.max(3),
  ]);
  public heuristics = new FormControl();

  private availableHeuristics: Map<string, string[]> = new Map();

  public applicableHeuristics: Map<string, string> = new Map();
  public annotatorId: string = '';
  private isHeuristicReasonChanged: boolean = false;
  private warningSnackbarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['warningSnackbar']};
  private successSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['successSnackbar']};
  private errorSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['errorSnackbar']};

  @Output() newAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  @Output() changedAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();

  constructor(private annotationService: AnnotationService, private changeDetector: ChangeDetectorRef, private _snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    this.annotatorId = this.previousAnnotation?.annotator.id + '';
    if (!this.disableEdit) {
      this.annotationService.getAvailableHeuristics().subscribe(res => this.initHeuristics(res, this.availableHeuristics));
    } else if (this.previousAnnotation) {
      let previousHeristics = this.previousAnnotation.applicableHeuristics.map(h => h.description);
      this.availableHeuristics.set(this.codeSmell, previousHeristics);
    }
  }

  public ngOnChanges(): void {
    this.severityFormControl.setValue(0);
    if (this.disableEdit) {
      this.severityFormControl.disable();
      this.heuristics.disable();
    }
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

  public getAvailableHeuristics(): string[] {
    return this.availableHeuristics.get(this.codeSmell)!;
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

  // TODO: Introduce an object model to avoid dictionaries
  private initHeuristics(input: Map<string, string[]>, heuristics: Map<string, string[]>): void {
    for (let keyValue of Object.entries(input)) {
      heuristics.set(keyValue[0], keyValue[1]);
    }
  }

  private addAnnotation(annotation: AnnotationDTO): void {
    this.annotationService.addAnnotation(annotation).subscribe(
      (res: Annotation) => {
        this._snackBar.open('Annotation added!', 'OK', this.successSnackBarOptions);
        this.newAnnotation.emit(new Annotation(res));
      },
      error => this._snackBar.open('ERROR:\n' + error.error.message, 'OK', this.errorSnackBarOptions)
    );
  }

  private updateAnnotation(annotation: AnnotationDTO): void {
    this.annotationService.updateAnnotation(this.previousAnnotation!.id, annotation).subscribe(
      (res: Annotation) => {
        this._snackBar.open('Annotation changed!', 'OK', this.successSnackBarOptions);
        this.changedAnnotation.emit(new Annotation(res));
      },
      error => this._snackBar.open('ERROR:\n' + error.error.message, 'OK', this.errorSnackBarOptions)
    );
  }

  private getAnnotationFromInput(): AnnotationDTO {
    return new AnnotationDTO({
      instanceId: this.instanceId,
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
      && !(this.heuristics.value.length == 0 && this.severityFormControl.value > 0);
  }

  private showErrorInputMessage(): void {
    if (!this.severityFormControl.valid) {
      this._snackBar.open('Severity must be between 0 and 3.', 'OK', this.warningSnackbarOptions);
    } else if (this.heuristics.value.length == 0 && this.severityFormControl.value > 0) {
      this._snackBar.open("For severity greater than 0 you must add heuristic.", 'OK', this.warningSnackbarOptions);
    }
  }

  public checkHeuristicCheckbox(heuristic: string, checked: boolean) {
    if (checked) {
      this.heuristics.value.push(heuristic);
    } else {
      let updatedHeuristics: string[] = [];
      this.heuristics.value.forEach((h: string) => {
        if (h != heuristic) updatedHeuristics.push(h);
      });
      this.heuristics.setValue(updatedHeuristics);
    }
  }

  public isHeuristicApplied(heuristic: string) {
    return this.heuristics.value.find((h: string) => h == heuristic) != undefined;
  }
}

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
  @Input() public instanceId: number | null = null;
  @Input() public previousAnnotation: Annotation | undefined;
  @Input() public disableEdit: boolean = false;

  public severityFormControl: FormControl = new FormControl('0', [
    Validators.required,
    Validators.min(0),
    Validators.max(3),
  ]);

  private availableHeuristics: Map<string, string[]> = new Map();
  public heuristicsAndReasons: Map<string, string> = new Map();
  public annotatorId: string = '';
  private warningSnackbarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['warningSnackbar']};
  private successSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['successSnackbar']};
  private errorSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['errorSnackbar']};

  @Output() newAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  @Output() changedAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();

  constructor(private annotationService: AnnotationService, private changeDetector: ChangeDetectorRef, private _snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    this.annotatorId = this.previousAnnotation?.annotator.id + '';
    this.annotationService.getAvailableHeuristics().subscribe(res => this.initHeuristics(res, this.availableHeuristics));
    if (this.previousAnnotation) this.setupInputFromPreviousAnnotation();
  }

  public ngOnChanges(): void {
    this.severityFormControl.setValue(0);
    if (this.disableEdit) this.severityFormControl.disable();
    this.heuristicsAndReasons = new Map();
    this.setupInputFromPreviousAnnotation();
  }

  public addReasonForHeuristic(target: EventTarget, heuristic: string): void {
    this.heuristicsAndReasons.set(heuristic, (target as HTMLInputElement).value);
  }

  public getAvailableHeuristics(): string[] {
    return this.availableHeuristics.get(this.codeSmell)!;
  }

  public annotate(): void {
    this.setAnnotateButtonDisableProperty(true);
    if (!this.isValidInput()) {
      this.showErrorInputMessage();
      this.setAnnotateButtonDisableProperty(false);
      return;
    }
    let annotation = this.getAnnotationFromInput();
    if (this.previousAnnotation) {
      this.updateAnnotation(annotation);
      this.setAnnotateButtonDisableProperty(false);
      return;
    }
    this.addAnnotation(annotation);
    this.setAnnotateButtonDisableProperty(false);
  }
  
  private setAnnotateButtonDisableProperty(value: boolean) {
    (<HTMLInputElement> document.getElementById("annotate-button")).disabled = value;
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
    for (let heuristic of this.heuristicsAndReasons.keys()) {
      ret.push(new SmellHeuristic({
        description: heuristic,
        isApplicable: true,
        reasonForApplicability: this.heuristicsAndReasons.get(heuristic)
      }));
    }
    return ret;
  }

  private setupInputFromPreviousAnnotation(): void {
    if (!this.previousAnnotation) return;
    this.severityFormControl.setValue(this.previousAnnotation.severity);
    this.codeSmell = this.previousAnnotation.instanceSmell.name;
    this.previousAnnotation.applicableHeuristics.forEach( h => {
      this.heuristicsAndReasons.set(h.description, h.reasonForApplicability);
    });
  }

  private isValidInput(): boolean {
    return this.severityFormControl.valid 
      && !(this.heuristicsAndReasons.size == 0 && this.severityFormControl.value > 0);
  }

  private showErrorInputMessage(): void {
    if (!this.severityFormControl.valid) {
      this._snackBar.open('Severity must be between 0 and 3.', 'OK', this.warningSnackbarOptions);
    } else if (this.heuristicsAndReasons.keys.length == 0 && this.severityFormControl.value > 0) {
      this._snackBar.open("For severity greater than 0 you must add heuristic.", 'OK', this.warningSnackbarOptions);
    }
  }

  public checkHeuristicCheckbox(heuristic: string, checked: boolean) {
    if (checked) {
      this.heuristicsAndReasons.set(heuristic, '');
    } else {
      this.heuristicsAndReasons.delete(heuristic);
    }
  }

  public isHeuristicApplied(heuristic: string) {
    return this.heuristicsAndReasons.has(heuristic);
  }
}

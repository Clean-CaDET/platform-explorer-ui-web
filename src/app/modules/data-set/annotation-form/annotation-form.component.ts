import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from 'src/app/session-storage.service';
import { Annotation } from '../model/annotation/annotation.model';
import { AnnotationDTO } from '../model/DTOs/annotation-dto/annotation-dto.model';
import { Instance } from '../model/instance/instance.model';
import { SmellHeuristic } from '../model/smell-heuristic/smell-heuristic.model';
import { AnnotationNotificationService } from '../services/annotation-notification.service';
import { AnnotationService } from '../services/annotation.service';


@Component({
  selector: 'de-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.css']
})
export class AnnotationFormComponent implements OnInit {

  @Input() public codeSmell: string = '';
  @Input() public instanceId: number = 0;
  public instance: Instance = new Instance(this.sessionService);
  public appliedHeuristicsAndReasons: Map<string, string> = new Map();
  public severityFormControl: FormControl = new FormControl('0', [Validators.required, Validators.min(0), Validators.max(3),]);
  private availableHeuristics: Map<string, string[]> = new Map();

  private warningSnackbarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['warningSnackbar']};
  private successSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['successSnackbar']};
  private errorSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['errorSnackbar']};

  // todo delete unnecessary
  @Input() public disableEdit: boolean = false;
  //

  constructor(private annotationService: AnnotationService, private _snackBar: MatSnackBar,
    private sessionService: SessionStorageService, private annotationNotificationService: AnnotationNotificationService) {}

  public ngOnInit(): void {
    this.annotationService.getAvailableHeuristics().subscribe(res => {
      for (let keyValue of Object.entries(res)) {
        this.availableHeuristics.set(keyValue[0], keyValue[1]);
      }
    });
  }

  public async ngOnChanges(): Promise<void> {
    this.instance = new Instance(this.sessionService, await this.annotationService.getInstanceWithAnnotations(this.instanceId));
    if (this.instance.hasAnnotationFromLoggedUser) this.setPreviousAnnotation();
    else this.initAnnotationForm();
  }

  private setPreviousAnnotation() {
    this.severityFormControl.setValue(this.instance.annotationFromLoggedUser?.severity);
    //this.codeSmell = this.previousAnnotation.instanceSmell.name; // todo check if necessary
    this.instance.annotationFromLoggedUser?.applicableHeuristics.forEach( h => {
      this.appliedHeuristicsAndReasons.set(h.description, h.reasonForApplicability);
    });
  }

  private initAnnotationForm() {
    this.severityFormControl.setValue(0);
    // if (this.disableEdit) this.severityFormControl.disable(); // todo check if necessary
    this.appliedHeuristicsAndReasons = new Map();
  }

  public heuristics(): string[] {
    return this.availableHeuristics.get(this.codeSmell)!;
  }

  public addReasonForHeuristic(target: EventTarget, heuristic: string): void {
    this.appliedHeuristicsAndReasons.set(heuristic, (target as HTMLInputElement).value);
  }

  public checkHeuristicCheckbox(heuristic: string, checked: boolean) {
    if (checked) {
      this.appliedHeuristicsAndReasons.set(heuristic, '');
    } else {
      this.appliedHeuristicsAndReasons.delete(heuristic);
    }
  }

  public isHeuristicApplied(heuristic: string) {
    return this.appliedHeuristicsAndReasons.has(heuristic);
  }

  public submitAnnotation(): void {
    this.setAnnotateButtonDisableProperty(true);
    if (!this.isValidInput()) this.showErrorInputMessage();
    else this.annotate();
    this.setAnnotateButtonDisableProperty(false);
  }
  
  private setAnnotateButtonDisableProperty(value: boolean) {
    (<HTMLInputElement> document.getElementById("annotate-button")).disabled = value;
  }

  private isValidInput(): boolean {
    return this.severityFormControl.valid 
      && !(this.appliedHeuristicsAndReasons.size == 0 && this.severityFormControl.value > 0);
  }

  private showErrorInputMessage(): void {
    if (!this.severityFormControl.valid) {
      this._snackBar.open('Severity must be between 0 and 3.', 'OK', this.warningSnackbarOptions);
    } else if (this.appliedHeuristicsAndReasons.keys.length == 0 && this.severityFormControl.value > 0) {
      this._snackBar.open("For severity greater than 0 you must add heuristic.", 'OK', this.warningSnackbarOptions);
    }
  }

  private annotate() {
    if (this.instance.annotationFromLoggedUser) this.updateAnnotation();
    else this.addAnnotation();
  }

  private updateAnnotation(): void {
    this.annotationService.updateAnnotation(this.instance.annotationFromLoggedUser!.id, this.getSubmittedAnnotation()).subscribe(
      (annotation: Annotation) => {
        this._snackBar.open('Annotation changed!', 'OK', this.successSnackBarOptions);
        this.annotationNotificationService.changedAnnotation.emit(annotation);
      },
      error => this._snackBar.open('ERROR:\n' + error.error.message, 'OK', this.errorSnackBarOptions)
    );
  }

  private addAnnotation(): void {
    this.annotationService.addAnnotation(this.getSubmittedAnnotation()).subscribe(
      (annotation: Annotation) => {
        this._snackBar.open('Annotation added!', 'OK', this.successSnackBarOptions);
        this.annotationNotificationService.newAnnotation.emit(annotation);
      },
      error => this._snackBar.open('ERROR:\n' + error.error.message, 'OK', this.errorSnackBarOptions)
    );
  }

  private getSubmittedAnnotation(): AnnotationDTO {
    return new AnnotationDTO({
      instanceId: this.instanceId,
      severity: this.severityFormControl.value,
      codeSmell: this.codeSmell,
      applicableHeuristics: this.getHeuristicsFromInput()
    });
  }

  private getHeuristicsFromInput(): SmellHeuristic[] {
    let ret: SmellHeuristic[] = [];
    for (let heuristic of this.appliedHeuristicsAndReasons.keys()) {
      ret.push(new SmellHeuristic({
        description: heuristic,
        isApplicable: true,
        reasonForApplicability: this.appliedHeuristicsAndReasons.get(heuristic)
      }));
    }
    return ret;
  }
}
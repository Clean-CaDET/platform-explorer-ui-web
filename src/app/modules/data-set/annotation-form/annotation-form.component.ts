import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Annotation } from '../model/annotation/annotation.model';
import { AnnotationDTO } from '../model/DTOs/annotation-dto/annotation-dto.model';
import { Instance } from '../model/instance/instance.model';
import { SmellHeuristic } from '../model/smell-heuristic/smell-heuristic.model';
import { AnnotationService } from '../services/annotation.service';
import { ChangedAnnotationEvent, NewAnnotationEvent, NotificationService } from '../services/shared/notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';
import { InstanceService } from '../services/instance.service';
import { DialogConfigService } from '../dialogs/dialog-config.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AnnotationNoteDialogComponent } from '../dialogs/annotation-note-dialog/annotation-note-dialog.component';


@Component({
  selector: 'de-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.css']
})
export class AnnotationFormComponent implements OnInit {

  @Input() public codeSmell: string = '';
  @Input() public instanceId: number = 0;
  public instance: Instance = new Instance(this.storageService);
  public appliedHeuristicsAndReasons: Map<string, string> = new Map();
  public severityFormControl: FormControl = new FormControl('0', [Validators.required, Validators.min(0), Validators.max(3),]);
  private availableHeuristics: Map<string, string[]> = new Map();
  public note: string = '';

  private warningSnackbarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['warningSnackbar']};
  private successSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['successSnackbar']};
  private errorSnackBarOptions: any = {horizontalPosition: 'center', verticalPosition: 'bottom', duration: 3000, panelClass: ['errorSnackbar']};

  // todo delete unnecessary
  @Input() public disableEdit: boolean = false;
  //

  constructor(private annotationService: AnnotationService, private _snackBar: MatSnackBar,
    private storageService: LocalStorageService, private notificationService: NotificationService,
    private instanceService: InstanceService, private dialog: MatDialog, private toastr: ToastrService) {}

  public ngOnInit(): void {
    this.annotationService.getAvailableHeuristics().subscribe(res => {
      for (let keyValue of Object.entries(res)) {
        this.availableHeuristics.set(keyValue[0], keyValue[1]);
      }
    });
  }

  public async ngOnChanges(): Promise<void> {
    this.instance = new Instance(this.storageService, await this.instanceService.getInstanceWithAnnotations(this.instanceId));
    this.instance.hasAnnotationFromLoggedUser ? this.setPreviousAnnotation() : this.initAnnotationForm();
  }

  private setPreviousAnnotation() {
    this.appliedHeuristicsAndReasons.clear();
    this.severityFormControl.setValue(this.instance.annotationFromLoggedUser?.severity);
    this.instance.annotationFromLoggedUser?.applicableHeuristics.forEach( h => {
      this.appliedHeuristicsAndReasons.set(h.description, h.reasonForApplicability);
    });
    if (this.instance.annotationFromLoggedUser?.note) this.note = this.instance.annotationFromLoggedUser?.note;
    else this.note = '';
  }

  private initAnnotationForm() {
    this.severityFormControl.setValue(0);
    // if (this.disableEdit) this.severityFormControl.disable(); // todo check if necessary
    this.appliedHeuristicsAndReasons = new Map();
  }

  public heuristics(): string[] {
    return this.availableHeuristics.get(this.codeSmell)!;
  }

  public checkHeuristicCheckbox(heuristic: string, checked: boolean) {
    checked ? this.appliedHeuristicsAndReasons.set(heuristic, '') : this.appliedHeuristicsAndReasons.delete(heuristic);
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
        this.notificationService.setEvent(new ChangedAnnotationEvent(annotation));
        this.instance.annotationFromLoggedUser!.note = this.note;
      },
      error => this._snackBar.open('ERROR:\n' + error.error.message, 'OK', this.errorSnackBarOptions)
    );
  }

  private addAnnotation(): void {
    this.annotationService.addAnnotation(this.getSubmittedAnnotation()).subscribe(
      (annotation: Annotation) => {
        this.instance.annotationFromLoggedUser = annotation;
        this.instance.hasAnnotationFromLoggedUser = true;
        this._snackBar.open('Annotation added!', 'OK', this.successSnackBarOptions);
        this.notificationService.setEvent(new NewAnnotationEvent(annotation));
      },
      error => this._snackBar.open('ERROR:\n' + error.error.message, 'OK', this.errorSnackBarOptions)
    );
  }

  private getSubmittedAnnotation(): AnnotationDTO {
    return new AnnotationDTO({
      instanceId: this.instanceId,
      severity: this.severityFormControl.value,
      codeSmell: this.codeSmell,
      applicableHeuristics: this.getHeuristicsFromInput(),
      note: this.note
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

  public addReasonForHeuristic(input: any, heuristic: string) {
    this.appliedHeuristicsAndReasons.set(heuristic, input.value);
  }

  public openNoteDialog() {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', this.note);
    let dialogRef = this.dialog.open(AnnotationNoteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((note: string) => {
      if (note) {
        this.note = note;
      }
    });
  }
} 

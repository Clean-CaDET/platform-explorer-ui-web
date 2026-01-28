import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Annotation } from '../model/annotation/annotation.model';
import { AnnotationDTO } from '../model/DTOs/annotation-dto/annotation-dto.model';
import { Instance } from '../model/instance/instance.model';
import { SmellHeuristic } from '../model/smell-heuristic/smell-heuristic.model';
import { AnnotationService } from '../services/annotation.service';
import {
  ChangedAnnotationEvent,
  NewAnnotationEvent,
  NotificationService,
} from '../services/shared/notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';
import { InstanceService } from '../services/instance.service';
import { DialogConfigService } from '../dialogs/dialog-config.service';
import { MatDialog } from '@angular/material/dialog';
import { AnnotationNoteDialogComponent } from '../dialogs/annotation-note-dialog/annotation-note-dialog.component';
import { Heuristic } from '../../annotation-schema/model/heuristic/heuristic.model';
import { AnnotationSchemaService } from '../../annotation-schema/services/annotation-schema.service';
import { Severity } from '../../annotation-schema/model/severity/severity.model';
import { GraphService } from '../../community-detection/services/graph.service';
import { GraphDataService } from '../../community-detection/services/graph-data.service';
import { ClassGraph } from '../../community-detection/model/class-graph';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'de-annotation-form',
    templateUrl: './annotation-form.component.html',
    styleUrls: ['./annotation-form.component.css'],
    standalone: true,
    imports: [
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
]
})
export class AnnotationFormComponent implements OnInit {
  @Input() public codeSmell: string = '';
  @Input() public instanceId: number = 0;
  @Input() public disableEdit: boolean = false;
  @Input() public annotatorId: number;
  public instance: Instance = new Instance(this.storageService);
  public appliedHeuristicsAndReasons: Map<string, string> = new Map();
  private availableHeuristics: Map<string, Heuristic[]> = new Map();
  public note: string = '';
  public chosenSeverity: string | null = null;
  public availableSeverities: Map<string, Severity[]> = new Map();
  public hasPreviousAnnotation: boolean;

  private warningSnackbarOptions: any = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 3000,
    panelClass: ['warningSnackbar'],
  };
  private successSnackBarOptions: any = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 3000,
    panelClass: ['successSnackbar'],
  };
  private errorSnackBarOptions: any = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 3000,
    panelClass: ['errorSnackbar'],
  };

  constructor(private annotationService: AnnotationService, private _snackBar: MatSnackBar,
    private storageService: LocalStorageService, private notificationService: NotificationService,
    private instanceService: InstanceService, private dialog: MatDialog, 
    private annotationSchemaService: AnnotationSchemaService,
    private graphService: GraphService, private graphDataService: GraphDataService) {}

  public ngOnInit(): void {
    this.annotationSchemaService.getHeuristicsForEachCodeSmell().subscribe(res => {
      for (let keyValue of Object.entries(res)) {
        this.availableHeuristics.set(keyValue[0], keyValue[1]);
      }
    });
    this.annotationSchemaService.getSeveritiesForEachCodeSmell().subscribe(res => {
      for (let keyValue of Object.entries(res)) {
        this.availableSeverities.set(keyValue[0], keyValue[1]);
      }
    });
  }

  public async ngOnChanges(): Promise<void> {
    this.instance = new Instance(this.storageService, await this.instanceService.getInstanceWithAnnotations(this.instanceId));
    if (!this.disableEdit) {
      this.instance.hasAnnotationFromLoggedUser ? this.setPreviousAnnotation(this.instance.annotationFromLoggedUser!) : this.initAnnotationForm();
    } else {
      this.setPreviousAnnotation(this.instance.annotations.find(a => a.annotator.id == this.annotatorId)!);
    }
    this.graphService.getClassGraph(this.instanceId).subscribe((classGraph: ClassGraph) => {
      this.graphService.initClassGraph(classGraph, this.instance.codeSnippetId);
      this.graphDataService.setMetricFeatures(this.instance.metricFeatures);
    });
  }

  private setPreviousAnnotation(previousAnnotation: Annotation) {
    this.hasPreviousAnnotation = true;
    this.appliedHeuristicsAndReasons.clear();
    this.chosenSeverity = previousAnnotation?.severity!;
    previousAnnotation?.applicableHeuristics.forEach(h => {
      this.appliedHeuristicsAndReasons.set(h.description, h.reasonForApplicability);
    });
    this.note = previousAnnotation?.note || '';
  }

  private initAnnotationForm() {
    this.hasPreviousAnnotation = false;
    this.chosenSeverity = null;
    this.appliedHeuristicsAndReasons = new Map();
    this.note = '';
  }

  public heuristics(): Heuristic[] {
    return this.availableHeuristics.get(this.codeSmell)!;
  }

  public severities(): Severity[] {
    return this.availableSeverities.get(this.codeSmell)!;
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
    (<HTMLInputElement>document.getElementById('save-button')).disabled = value;
  }

  private isValidInput(): boolean {
    return this.chosenSeverity != null;
  }

  private showErrorInputMessage(): void {
    this._snackBar.open('You must enter a severity.', 'OK', this.warningSnackbarOptions);
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
        this.hasPreviousAnnotation = true;
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
        this.hasPreviousAnnotation = true;
      },
      (error) => this._snackBar.open('ERROR:\n' + error.error.message, 'OK', this.errorSnackBarOptions)
    );
  }

  private getSubmittedAnnotation(): AnnotationDTO {
    return new AnnotationDTO({
      instanceId: this.instanceId,
      severity: this.chosenSeverity,
      codeSmell: this.codeSmell,
      applicableHeuristics: this.getHeuristicsFromInput(),
      note: this.note,
    });
  }

  private getHeuristicsFromInput(): SmellHeuristic[] {
    let ret: SmellHeuristic[] = [];
    for (let heuristic of this.appliedHeuristicsAndReasons.keys()) {
      ret.push(
        new SmellHeuristic({
          description: heuristic,
          isApplicable: true,
          reasonForApplicability: this.appliedHeuristicsAndReasons.get(heuristic),
        })
      );
    }
    return ret;
  }

  public addReasonForHeuristic(input: any, heuristic: string) {
    this.appliedHeuristicsAndReasons.set(heuristic, input.value);
  }

  public openNoteDialog() {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', {note: this.note, disableEdit: this.disableEdit});
    let dialogRef = this.dialog.open(AnnotationNoteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((note: string) => {
      if (note != null) {
        this.note = note;
      }
    });
  }

  public changeSeverity() {
    this.chosenSeverity = null;
    this.hasPreviousAnnotation = false;
  }

  @HostListener('window:keydown', ['$event'])
  public next(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      event.stopPropagation();
      this.submitAnnotation();
    } else if (event.ctrlKey && event.key == ' ') {
      event.preventDefault();
      event.stopPropagation();
      document.getElementById('chosenSeverity')?.click();
    }
  }
} 

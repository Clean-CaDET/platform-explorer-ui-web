import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { DisagreeingAnnotationsDialogComponent } from '../dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component';

import { Annotation } from '../model/annotation/annotation.model';
import { Instance } from '../model/instance/instance.model';
import { AnnotationStatus, InstanceFilter } from '../model/enums/enums.model';

import { DialogConfigService } from '../dialogs/dialog-config.service';
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';
import { FormControl, Validators } from '@angular/forms';
import { AnnotationService } from '../annotation/annotation.service';

@Component({
  selector: 'de-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css'],
})
export class InstanceComponent {

  public instances: Instance[] = [];
  @Input() public filter: InstanceFilter = InstanceFilter.All;
  @Input() public candidateInstances: SmellCandidateInstances[] = [];
  private initiallyDisplayedColumns: string[] = ['codeSnippetId', 'annotated', 'severity'];
  public displayedColumns: string[] = this.initiallyDisplayedColumns;
  public dataSource: MatTableDataSource<Instance> = new MatTableDataSource<Instance>(this.instances);
  public searchInput: string = '';

  public annotationStatuses: string[] = Object.keys(AnnotationStatus);
  public selectedAnnotationStatus: AnnotationStatus = AnnotationStatus.All;

  public severityValues: Set<number> = new Set();
  public selectedSeverity: number | null = null;

  public codeSmells: string[] = [];
  public selectedCodeSmell: string = '';

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  public selectFormControl = new FormControl('', Validators.required);
  public chosenInstance: Instance | null = new Instance();
  public annotatorId = AnnotationService.getLoggedInAnnotatorId();

  @Output() instanceToAnnotate = new EventEmitter<Instance>();
  @Output() selectedSmell = new EventEmitter<string>();
  @Output() previousAnnotation = new EventEmitter<Annotation>();

  @Input() newAnnotation: Annotation | undefined;
  @Input() changedAnnotation: Annotation | undefined;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog) { }

  public ngOnChanges(): void {
    this.setInitSmellSelection();
    this.severityValues.clear();
    this.selectedSeverity = null;
    this.showFilteredInstances();
  }

  private setInitSmellSelection() {
    this.codeSmells = [];
    this.candidateInstances.forEach(instances => this.codeSmells.push(instances.codeSmell?.name!));
    this.selectedCodeSmell = sessionStorage.getItem('codeSmellFilter')!;
    this.selectFormControl.setValue(this.selectedCodeSmell);
  }

  public ngDoCheck() {
    if (this.newAnnotation) this.addAnnotation();
    if (this.changedAnnotation) this.changeAnnotation();
    
    this.showFilteredInstances();
  }

  private addAnnotation() {
    let i = this.instances.findIndex(i => i.id == this.chosenInstance?.id);
    if (i != -1) {
      this.instances[i].annotations.push(this.newAnnotation!);
      this.dataSource.data = this.instances;
    }
  }

  private changeAnnotation() {
    let i = this.instances.findIndex(i => i.id == this.chosenInstance?.id);
    let j = -1;
    if (i != -1) j = this.instances[i].annotations.findIndex(a => a.id == this.changedAnnotation?.id);
    if (j != -1) this.instances[i].annotations[j] = this.changedAnnotation!;
  }

  private instanceHasSelectedAnnotationStatus(instance: Instance): boolean {
    switch (this.selectedAnnotationStatus) {
      case AnnotationStatus.Annotated: {
        return instance.hasAnnotationFromLoggedUser;
      }
      case AnnotationStatus.Not_Annotated: { 
        return !instance.hasAnnotationFromLoggedUser;
      } 
      case AnnotationStatus.All: { 
        return true;
      } 
    }
  }

  private instanceHasSelectedSeverity(instance: Instance): boolean {
    return instance.annotationFromLoggedUser?.severity == this.selectedSeverity;
  }

  private filterForCodeSmell(): Instance[] {
    for (let candidate of this.candidateInstances) {
      if (candidate.codeSmell?.name == this.selectedCodeSmell) {
        return this.setAnnotatorForInstances(candidate.instances);
      }
    }
    return [];
  }

  private setAnnotatorForInstances(instances: Instance[]): Instance[] {
    instances.forEach((instance, index) => instances[index] = new Instance(instance));
    return instances;
  }

  public showAllAnnotations(annotations: Annotation[], instanceId: number): void {
    let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', {annotations: annotations, instanceId: instanceId});
    this.dialog.open(DisagreeingAnnotationsDialogComponent, dialogConfig);
  }

  public formatUrl(url: string): string {
    const hairSpace: string = '\u200a';
    url = url.split('_').join(`_${hairSpace}`);
    return url.split('.').join(`.${hairSpace}`);
  }

  public showFilteredInstances(): void {
    this.severityValues.clear();
    this.displayedColumns = this.initiallyDisplayedColumns.slice();
    if (this.filter == InstanceFilter.DisagreeingAnnotations) {
      this.displayedColumns.push('show-annotations');
    }
    this.instances = this.filterForCodeSmell();
    this.instances.forEach((i:any) => {
      this.severityValues.add(i.annotationFromLoggedUser?.severity);
    });
    this.dataSource.data = this.instances.filter(i =>
      this.instanceHasSelectedAnnotationStatus(i)
      && i.codeSnippetId.toLowerCase().includes(this.searchInput.toLowerCase())
    );

    if (this.selectedSeverity != null || this.selectedSeverity != undefined) {
      this.dataSource.data = this.dataSource.data.filter(i =>
        this.instanceHasSelectedSeverity(i)
      );
    }
  }

  public chooseInstance(instance: Instance): void {
    this.chosenInstance = instance;
    this.instanceToAnnotate.emit(this.chosenInstance);
    this.selectedSmell.emit(this.selectedCodeSmell);
    this.previousAnnotation.emit(this.chosenInstance.annotations.find(a => a.annotator.id == this.annotatorId)!);
  }

  public smellSelectionChanged() {
    sessionStorage.setItem('codeSmellFilter', this.selectedCodeSmell);
    this.selectFormControl.setValue(this.selectedCodeSmell);
    this.showFilteredInstances();
  }
}

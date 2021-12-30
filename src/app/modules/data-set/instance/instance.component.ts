import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { RelatedInstance } from '../model/related-instance/related-instance.model';

@Component({
  selector: 'de-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css'],
})
export class InstanceComponent implements OnInit {

  public instances: Instance[] = [];
  @Input() public filter: InstanceFilter | null = null;
  @Input() public candidateInstances: SmellCandidateInstances[] = [];
  public instanceFilter = InstanceFilter;
  private initiallyDisplayedColumns: string[] = ['codeSnippetId', 'annotated', 'severity'];
  public displayedColumns: string[] = this.initiallyDisplayedColumns;
  public displayedColumnsRelatedInstances: string[] = ['codeSnippetId', 'relationType', 'couplingStrength'];
  public previousAnnotation: Annotation | null = null;
  public dataSource: MatTableDataSource<Instance> = new MatTableDataSource<Instance>(this.instances);
  public dataSourceRelatedInstances: MatTableDataSource<RelatedInstance> = new MatTableDataSource<RelatedInstance>();
  public searchInput: string = '';
  public chosenInstanceName: string = '';

  public annotationStatuses: string[] = Object.keys(AnnotationStatus);
  public selectedAnnotationStatus: AnnotationStatus = AnnotationStatus.All;

  public severityValues: Set<number> = new Set();
  public selectedSeverity: number | null = null;

  public codeSmells: string[] = [];
  @Input() public selectedCodeSmell: string = '';

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  private iframe: HTMLIFrameElement = document.getElementById('snippet') as HTMLIFrameElement;
  public selectFormControl = new FormControl('', Validators.required);
  public chosenInstance: Instance | null = new Instance();
  public annotatorId = AnnotationService.getLoggedInAnnotatorId();
  public panelOpenState = false;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog) { }

  public ngOnInit(): void {
    this.selectFormControl.markAsTouched();
  }

  public ngOnChanges(): void {
    if (this.iframe) this.iframe.srcdoc = '';
    this.selectedCodeSmell = '';
    this.severityValues.clear();
    this.selectedSeverity = null;
    this.dataSource.data = [];
    this.codeSmells = [];
    this.candidateInstances.forEach(instances => this.codeSmells.push(instances.codeSmell?.name!));
    this.chosenInstance = new Instance();
    this.selectFormControl.setValue('');
  }

  public ngAfterViewChecked(): void {
    this.iframe = document.getElementById('snippet') as HTMLIFrameElement;
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

  public filtersChanged(): void {
    if (this.iframe) this.iframe.srcdoc = '';
    this.chosenInstance = null;
    this.showFilteredInstances();
  }

  public async addAnnotation(annotation: Annotation): Promise<void> {
    let i = this.instances.findIndex(i => i.id == this.chosenInstance?.id);
    this.instances[i].annotations.push(annotation);
    this.showFilteredInstances();
  }

  public async changeAnnotation(annotation: Annotation) {
    let i = this.instances.findIndex(i => i.id == this.chosenInstance?.id);
    let j = this.instances[i].annotations.findIndex(a => a.id == annotation.id);
    this.instances[i].annotations[j] = annotation;
    this.showFilteredInstances();
  }

  public searchInstances(): void {
    this.iframe.srcdoc = this.createSrcdocFromGithubLink(this.chosenInstance?.link!);
    this.showFilteredInstances();
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

  private showFilteredInstances(): void {
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

  private createSrcdocFromGithubLink(githubLink: string): string {
    let completeLink = 'https://emgithub.com/embed.js?target=' + encodeURIComponent(githubLink) + '&style=github&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on';
    return '<script src=\"' + completeLink + '\"></script>';
  }

  public chooseInstance(instance: Instance): void {
    this.chosenInstance = instance;
    this.chosenInstanceName = this.chosenInstance?.codeSnippetId.split('.').pop()!;
    this.dataSourceRelatedInstances.data = this.chosenInstance.relatedInstances;
    this.previousAnnotation = this.chosenInstance.annotations.find(a => a.annotator.id == this.annotatorId)!;
    this.iframe.srcdoc = this.createSrcdocFromGithubLink(this.chosenInstance.link);
  }

  public newProjectSelected(event: any): void {
    this.selectedCodeSmell = "";
  }
}

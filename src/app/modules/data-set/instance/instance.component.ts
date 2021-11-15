import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { DisagreeingAnnotationsDialogComponent } from '../dialogs/disagreeing-annotations-dialog/disagreeing-annotations-dialog.component';

import { Annotation } from '../model/annotation/annotation.model';
import { Instance } from '../model/instance/instance.model';
import { AnnotationStatus, InstanceFilter, InstanceType } from '../model/enums/enums.model';

import { DialogConfigService } from '../dialogs/dialog-config.service';
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';

@Component({
  selector: 'de-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css']
})
export class InstanceComponent implements OnInit {

  public instances: Instance[] = [];
  @Input() public filter: InstanceFilter = InstanceFilter.All;
  @Input() public candidateInstances: SmellCandidateInstances[] = [];
  public instanceFilter = InstanceFilter;
  private initiallyDisplayedColumns: string[] = ['select', 'codeSnippetId', 'annotated'];
  public displayedColumns: string[] = this.initiallyDisplayedColumns;
  public previousAnnotation: Annotation | null = null;
  public selection: SelectionModel<Instance> = new SelectionModel<Instance>(true, []);
  public dataSource: MatTableDataSource<Instance> = new MatTableDataSource<Instance>(this.instances);
  public searchInput: string = '';

  public annotationStatuses: string[] = Object.keys(AnnotationStatus);
  public selectedAnnotationStatus: AnnotationStatus = AnnotationStatus.All;

  public codeSmells: string[] = [];
  public selectedCodeSmell: string = '';

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  private iframe: HTMLIFrameElement = document.getElementById('snippet') as HTMLIFrameElement;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog) { }

  public ngOnInit(): void {
  }

  public ngOnChanges(): void {
    this.selectedCodeSmell = '';
    this.dataSource.data = [];
    this.codeSmells = [];
    this.candidateInstances.forEach(instances => this.codeSmells.push(instances.codeSmell?.name!));
    this.selection.clear();
  }

  public ngAfterViewChecked(): void {
    this.iframe = document.getElementById('snippet') as HTMLIFrameElement;
  }

  public toggleInstanceSelection(selectedInstance: Instance): void {
    this.iframe.srcdoc = '';
    this.previousAnnotation = null;
    if (!this.selection.isSelected(selectedInstance)) {
      this.selection.clear();
    }
    this.selection.toggle(selectedInstance);
    if (this.selection.selected.length == 1) {
      this.previousAnnotation = selectedInstance.annotationFromLoggedUser;
      this.iframe.srcdoc = this.createSrcdocFromGithubLink(selectedInstance.link);
    }
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
    this.selection.clear();
    if (this.iframe) {
      this.iframe.srcdoc = '';
    }
    this.showFilteredInstances();
  }

  public async addAnnotation(annotation: Annotation): Promise<void> {
    let i = this.instances.findIndex(i => i.id == this.selection.selected[0].id);
    this.instances[i].annotations.push(annotation);
    this.filtersChanged();
  }

  public async changeAnnotation(annotation: Annotation) {
    let i = this.instances.findIndex(i => i.id == this.selection.selected[0].id);
    let j = this.instances[i].annotations.findIndex(a => a.id == annotation.id);
    this.instances[i].annotations[j] = annotation;
    this.filtersChanged();
  }

  public searchInstances(): void {
    if (this.selection.selected.length == 1) {
      this.toggleInstanceSelection(this.selection.selected[0]);
    }
    this.showFilteredInstances();
  }

  public showAllAnnotations(annotations: Annotation[], instanceId: number): void {
    let dialogConfig = DialogConfigService.setDialogConfig('550px', '700px', {annotations: annotations, instanceId: instanceId});
    this.dialog.open(DisagreeingAnnotationsDialogComponent, dialogConfig);
  }

  public formatUrl(url: string): string {
    const hairSpace: string = '\u200a';
    url = url.split('_').join(`_${hairSpace}`);
    return url.split('.').join(`.${hairSpace}`);
  }

  private showFilteredInstances(): void {
    this.displayedColumns = this.initiallyDisplayedColumns.slice();
    if (this.filter == InstanceFilter.DisagreeingAnnotations) {
      this.displayedColumns.push('show-annotations');
    }
    this.instances = this.filterForCodeSmell();
    this.dataSource.data = this.instances.filter(i =>
      this.instanceHasSelectedAnnotationStatus(i)
      && i.codeSnippetId.toLowerCase().includes(this.searchInput.toLowerCase())
    );
  }

  private createSrcdocFromGithubLink(githubLink: string): string {
    let completeLink = 'https://emgithub.com/embed.js?target=' + encodeURIComponent(githubLink) + '&style=github&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on';
    return '<script src=\"' + completeLink + '\"></script>';
  }

}

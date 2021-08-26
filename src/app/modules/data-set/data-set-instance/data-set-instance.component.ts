import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model';
import { AnnotationStatus, InstanceType } from '../model/enums/enums.model';

@Component({
  selector: 'de-data-set-instance',
  templateUrl: './data-set-instance.component.html',
  styleUrls: ['./data-set-instance.component.css']
})
export class DataSetInstanceComponent implements OnInit {

  @Input() public instances: DataSetInstance[] = [];
  @Input() public instancesType: string = '';
  public previousAnnotation: DataSetAnnotation | null = null;
  public displayedColumns = ['select', 'codeSnippetId', 'annotated'];
  public selection = new SelectionModel<DataSetInstance>(true, []);
  public dataSource = new MatTableDataSource<DataSetInstance>(this.instances);
  public searchInput: string = '';

  public instanceTypes: string[] = Object.keys(InstanceType);
  public selectedInstanceType: InstanceType = InstanceType.Method;

  public annotationStatuses: string[] = Object.keys(AnnotationStatus);
  public selectedAnnotationStatus: AnnotationStatus = AnnotationStatus.Not_Annotated;

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  private iframe: HTMLIFrameElement = document.getElementById('snippet') as HTMLIFrameElement;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor() { }

  public ngOnInit(): void {
  }

  public ngOnChanges() {
    this.selection.clear();
    if (!this.isInstancesEmpty()) {
      let annotatorId: number = +sessionStorage.getItem('annotatorID')!;
      this.instances.forEach((instance, index) => this.instances[index] = new DataSetInstance(instance, annotatorId));
      this.filtersChanged();
    }
  }

  public ngAfterViewChecked() {
    this.iframe = document.getElementById('snippet') as HTMLIFrameElement;
  }

  public toggleInstanceSelection(selectedInstance: DataSetInstance) {
    this.iframe.srcdoc = '';
    this.previousAnnotation = null;
    if (!this.selection.isSelected(selectedInstance)) {
      this.selection.clear();
    }
    this.selection.toggle(selectedInstance);
    if (this.selection.selected.length == 1) {
      this.previousAnnotation = selectedInstance.annotationFromLoggedUser!;
      this.iframe.srcdoc = this.createSrcdocFromGithubLink(selectedInstance.link);
    }
  }

  private instanceHasSelectedInstanceType(instance: DataSetInstance): boolean {
    switch (this.selectedInstanceType) {
      case InstanceType.Class: {
        return instance.type == InstanceType.Class;
      }
      case InstanceType.Method: { 
        return instance.type == InstanceType.Method;
      } 
      case InstanceType.All: { 
        return true;
      } 
    }
  }

  private instanceHasSelectedAnnotationStatus(instance: DataSetInstance): boolean {
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

  public filtersChanged(): void {
    this.selection.clear();
    if (this.iframe) {
      this.iframe.srcdoc = '';
    }
    this.showFilteredInstances();
  }

  public async addAnnotation(annotation: DataSetAnnotation) {
    let i = this.instances.findIndex(i => i.id == this.selection.selected[0].id);
    this.instances[i].annotations.push(annotation);
    this.instances[i] = new DataSetInstance(this.instances[i]);
    this.filtersChanged();
  }

  public async changeAnnotation(annotation: DataSetAnnotation) {
    let i = this.instances.findIndex(i => i.id == this.selection.selected[0].id);
    let j = this.instances[i].annotations.findIndex(a => a.id == annotation.id);
    this.instances[i].annotations[j] = annotation;
    this.instances[i] = new DataSetInstance(this.instances[i]);
    this.filtersChanged();
  }

  public searchInstances(): void {
    if (this.selection.selected.length == 1) {
      this.toggleInstanceSelection(this.selection.selected[0]);
    }
    this.showFilteredInstances();
  }

  public isInstancesEmpty(): boolean {
    return this.instances.length == 0;
  }

  private showFilteredInstances(): void {
    this.dataSource.data = this.instances.filter(i => 
      this.instanceHasSelectedInstanceType(i)
      && this.instanceHasSelectedAnnotationStatus(i)
      && i.codeSnippetId.toLowerCase().includes(this.searchInput.toLowerCase())
    );
  }

  private createSrcdocFromGithubLink(githubLink: string): string {
    let completeLink = 'https://emgithub.com/embed.js?target=' + encodeURIComponent(githubLink) + '&style=github&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on';
    return '<script src=\"' + completeLink + '\"></script>';
  }

}

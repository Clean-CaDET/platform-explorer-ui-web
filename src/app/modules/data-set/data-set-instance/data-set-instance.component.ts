import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataSetAnnotation } from '../model/data-set-annotation/data-set-annotation.model';
import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model';
import { InstanceFilter, InstanceType } from '../model/enums/enums.model';

@Component({
  selector: 'de-data-set-instance',
  templateUrl: './data-set-instance.component.html',
  styleUrls: ['./data-set-instance.component.css']
})
export class DataSetInstanceComponent implements OnInit {

  @Input() public instances: DataSetInstance[] = [];
  @Input() public filter: InstanceFilter = InstanceFilter.All;
  public instanceFilter = InstanceFilter;
  private initiallyDisplayedColumns: string[] = ['select', 'codeSnippetId', 'annotated'];
  public displayedColumns: string[] = this.initiallyDisplayedColumns;
  public previousAnnotation: DataSetAnnotation | null = null;
  public selection = new SelectionModel<DataSetInstance>(true, []);
  public dataSource = new MatTableDataSource<DataSetInstance>(this.instances);
  public instanceTypes: string[] = Object.keys(InstanceType);
  public selectedInstanceType: InstanceType = InstanceType.Method;

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
      this.dataSource.data = this.instances;
      this.selectedInstanceTypeChanged();
      this.configureViewByFilter();
    }
    if (this.iframe) {
      this.iframe.srcdoc = '';
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

  public selectedInstanceTypeChanged() {
    this.selection.clear();
    switch (this.selectedInstanceType) {
      case InstanceType.Class: {
        this.dataSource.data = this.instances.filter(i => i.type == InstanceType.Class);
        break;
      }
      case InstanceType.Method: { 
        this.dataSource.data = this.instances.filter(i => i.type == InstanceType.Method);
        break; 
      } 
      case InstanceType.All: { 
        this.dataSource.data = this.instances;
        break; 
      } 
    }
  }

  public async addAnnotation(annotation: DataSetAnnotation) {
    for (let i = 0; i < this.instances.length; i++) {
      if (this.instances[i].id == this.selection.selected[0].id) {
        this.instances[i].annotations.push(annotation);
        this.instances[i] = new DataSetInstance(this.instances[i]);
        break;
      }
    }
    this.selectedInstanceTypeChanged();
  }

  public async changeAnnotation(annotation: DataSetAnnotation) {
    for (let i = 0; i < this.instances.length; i++) {
      if (this.instances[i].id == this.selection.selected[0].id) {
        for (let j = 0; j < this.instances[i].annotations.length; j++) {
          if (this.instances[i].annotations[j].id == annotation.id) {
            this.instances[i].annotations[j] = annotation;
            break;
          }
        }
        this.instances[i] = new DataSetInstance(this.instances[i]);
        break;
      }
    }
    this.selectedInstanceTypeChanged();
  }

  public isInstancesEmpty(): boolean {
    return this.instances.length == 0;
  }

  private configureViewByFilter(): void {
    this.displayedColumns = this.initiallyDisplayedColumns.slice();
    if (this.filter == InstanceFilter.DisagreeingAnnotations) {
      this.displayedColumns.push('show-annotations');
    }
  }

  private createSrcdocFromGithubLink(githubLink: string): string {
    let linkParts = githubLink.split('#');
    let lineNumbers = linkParts[1].split(/[L\-]/).filter(i => i);
    let completeLink = 'http://gist-it.appspot.com/' + linkParts[0] + '?slice=' + (+lineNumbers[0]-1) + ':' + lineNumbers[1];
    return '<script src=\"' + completeLink + '\"></script>';
  }

}

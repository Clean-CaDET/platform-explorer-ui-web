import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataSetInstance } from '../model/data-set-instance/data-set-instance.model';

@Component({
  selector: 'de-data-set-instance',
  templateUrl: './data-set-instance.component.html',
  styleUrls: ['./data-set-instance.component.css']
})
export class DataSetInstanceComponent implements OnInit {

  @Input() public instances: DataSetInstance[] = [];
  public displayedColumns = ['select', 'codeSnippetId', 'type'];
  public selection = new SelectionModel<DataSetInstance>(true, []);
  public dataSource = new MatTableDataSource<DataSetInstance>(this.instances);

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  private iframe: HTMLIFrameElement = document.getElementById('snippet') as HTMLIFrameElement;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor() { }

  ngOnInit(): void {    
  }

  ngOnChanges() {
    this.selection.clear();
    if (!this.isInstancesEmpty()) {
      this.dataSource.data = this.instances;
    }
    if (this.iframe){
      this.iframe.srcdoc = '';
    }
  }

  ngAfterViewChecked() {
    this.iframe = document.getElementById('snippet') as HTMLIFrameElement;
  }

  public toggleInstanceSelection(selectedInstance: DataSetInstance) {
    if (!this.selection.isSelected(selectedInstance)) {
      this.selection.clear();
    }
    this.selection.toggle(selectedInstance);
    if (this.selection.selected.length == 1) {
      this.iframe.srcdoc = this.createSrcdocFromGithubLink(selectedInstance.link);
    }
  }

  public isInstancesEmpty(): boolean {
    return this.instances.length == 0;
  }

  private createSrcdocFromGithubLink(githubLink: string): string {
    let linkParts = githubLink.split('#');
    let lineNumbers = linkParts[1].split(/[L\-]/).filter(i => i);
    let completeLink = 'http://gist-it.appspot.com/' + linkParts[0] + '?slice=' + (+lineNumbers[0]-1) + ':' + lineNumbers[1];
    return '<script src=\"' + completeLink + '\"></script>';
  }

}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Annotation } from '../model/annotation/annotation.model';
import { Instance } from '../model/instance/instance.model';
import { RelatedInstance } from '../model/related-instance/related-instance.model';


@Component({
  selector: 'de-annotation-container',
  templateUrl: './annotation-container.component.html',
  styleUrls: ['./annotation-container.component.css']
})
export class AnnotationContainerComponent {

  @Input() public chosenInstance: Instance | undefined;
  @Input() public selectedCodeSmell: string = '';
  @Input() public previousAnnotation: Annotation | undefined;

  @Output() newAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();
  @Output() changedAnnotation: EventEmitter<Annotation> = new EventEmitter<Annotation>();

  public displayedColumnsRelatedInstances: string[] = ['codeSnippetId', 'relationType', 'couplingStrength'];
  public dataSourceRelatedInstances: MatTableDataSource<RelatedInstance> = new MatTableDataSource<RelatedInstance>();
  public chosenInstanceName: string = '';
  public iframe: HTMLIFrameElement = document.getElementById('snippet') as HTMLIFrameElement;
  
  constructor() { }

  public ngAfterViewChecked(): void {
    if (!this.iframe) this.iframe = document.getElementById('snippet') as HTMLIFrameElement;
    if (this.iframe && sessionStorage.getItem('changeView')=='true') {
      this.iframe.srcdoc = '';
      this.chosenInstance = new Instance();
      sessionStorage.setItem('changeView', 'false')
    }
  }

  public ngOnChanges(): void {
    if (this.chosenInstance?.link) {
      var newSrcDoc = this.createSrcdocFromGithubLink(this.chosenInstance.link);
      if (newSrcDoc != this.iframe.srcdoc) this.iframe.srcdoc = newSrcDoc;
    }
    
    if (this.chosenInstance) this.dataSourceRelatedInstances.data = this.chosenInstance.relatedInstances;

    var newName = this.chosenInstance?.codeSnippetId.split('.').pop()!;
    if (newName != this.chosenInstanceName) this.chosenInstanceName = newName;
  }

  private createSrcdocFromGithubLink(githubLink: string): string {
    let completeLink = 'https://emgithub.com/embed.js?target=' + encodeURIComponent(githubLink) + '&style=github&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on';
    return '<script src=\"' + completeLink + '\"></script>';
  }

  public formatUrl(url: string): string {
    const hairSpace: string = '\u200a';
    url = url.split('_').join(`_${hairSpace}`);
    return url.split('.').join(`.${hairSpace}`);
  }

  public async changeAnnotation(annotation: Annotation) {
    this.changedAnnotation.emit(annotation);
  }

  public async addAnnotation(annotation: Annotation): Promise<void> {
    this.newAnnotation.emit(annotation);
  }
}

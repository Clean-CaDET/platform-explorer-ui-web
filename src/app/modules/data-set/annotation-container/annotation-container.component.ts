import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params } from '@angular/router';
import { Instance } from '../model/instance/instance.model';
import { RelatedInstance } from '../model/related-instance/related-instance.model';
import { AnnotationService } from '../services/annotation.service';
import { NotificationService } from '../services/shared/notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';


@Component({
  selector: 'de-annotation-container',
  templateUrl: './annotation-container.component.html',
  styleUrls: ['./annotation-container.component.css']
})
export class AnnotationContainerComponent implements OnInit {

  public selectedSmell: string = '';
  public chosenInstance: Instance = new Instance(this.storageService);
  public dataSourceRelatedInstances: MatTableDataSource<RelatedInstance> = new MatTableDataSource<RelatedInstance>();
  public displayedColumnsRelatedInstances: string[] = ['codeSnippetId', 'relationType', 'couplingStrength', 'couplingType'];
  public totalCouplingStrength: Map<number, number> = new Map();
  public iframe: HTMLIFrameElement = document.getElementById('snippet') as HTMLIFrameElement;
  
  constructor(private storageService: LocalStorageService, 
    private annotationService: AnnotationService, private route: ActivatedRoute,
    private annotationNotificationService: NotificationService) { 
  }

  async ngOnInit() {
    this.route.params.subscribe(async (params: Params) => {
      this.chosenInstance = await this.annotationService.getInstanceWithRelatedInstances(params['instanceId']);
      this.dataSourceRelatedInstances.data = this.chosenInstance.relatedInstances.sort((a, b) => a.relationType.toString().localeCompare(b.relationType.toString())).map(i => new RelatedInstance(i));
      var storedSmell = this.storageService.getSmellFilter();
      if (storedSmell != null) this.selectedSmell = storedSmell;
      this.countTotalCoupling();
      if (!this.iframe) this.iframe = document.getElementById('snippet') as HTMLIFrameElement;
      this.iframe.srcdoc = this.createSrcdocFromGithubLink(this.chosenInstance.link);
      this.annotationNotificationService.instanceChosen.emit(this.chosenInstance);
    });
  }

  private countTotalCoupling() {
    this.chosenInstance.relatedInstances.forEach(instance => {
      this.totalCouplingStrength.set(instance.id, 0);
      Object.entries(instance.couplingTypeAndStrength).forEach(coupling => {
        this.totalCouplingStrength.set(instance.id, this.totalCouplingStrength.get(instance.id)+coupling[1]);
      });
    });
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
}

@Pipe({name: 'couplingDetails'})
export class CouplingDetailsPipe implements PipeTransform {
  transform(value: Map<number, number>): string {
    var result = '';
    Object.entries(value).forEach(coupling => {
      result += coupling[0] + ': ' + coupling[1] + '\n';
    });
    return result;
  }
}

@Pipe({name: 'className'})
export class ClassNamePipe implements PipeTransform {
  transform(value: string): string {
    return value.split('.').pop()!;
  }
}

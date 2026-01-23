import { Component, HostListener, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params } from '@angular/router';
import { Instance } from '../model/instance/instance.model';
import { RelatedInstance } from '../model/related-instance/related-instance.model';
import { InstanceChosenEvent, NextInstanceEvent, NotificationService, PreviousInstanceEvent } from '../services/shared/notification.service';
import { LocalStorageService } from '../services/shared/local-storage.service';
import { InstanceService } from '../services/instance.service';

@Component({
  selector: 'de-annotation-container',
  templateUrl: './annotation-container.component.html',
  styleUrls: ['./annotation-container.component.css'],
})
export class AnnotationContainerComponent implements OnInit {
  public selectedSmell: string = '';
  public chosenInstance: Instance = new Instance(this.storageService);
  public dataSourceRelatedInstances: MatTableDataSource<RelatedInstance> = new MatTableDataSource<RelatedInstance>();
  public displayedColumnsRelatedInstances: string[] = [
    'codeSnippetId',
    'relationType',
    'couplingStrength',
    'couplingType',
  ];
  public totalCouplingStrength: Map<number, number> = new Map();
  public iframe: HTMLIFrameElement = document.getElementById('snippet') as HTMLIFrameElement;

  constructor(
    private storageService: LocalStorageService,
    private instanceService: InstanceService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params: Params) => {
      this.chosenInstance = await this.instanceService.getInstanceWithRelatedInstances(params['instanceId']);
      this.chosenInstance.projectId = params['projectId'];
      this.dataSourceRelatedInstances.data = this.chosenInstance.relatedInstances
        .sort((a, b) => a.relationType.toString().localeCompare(b.relationType.toString()))
        .map((i) => new RelatedInstance(i));
      var storedSmell = this.storageService.getSmellFilter();
      if (storedSmell != null) this.selectedSmell = storedSmell;
      this.countTotalCoupling();
      if (!this.iframe) this.iframe = document.getElementById('snippet') as HTMLIFrameElement;
      await this.loadSourceCode(params['instanceId']);
      this.notificationService.setEvent(new InstanceChosenEvent(this.chosenInstance));
    });
  }

  private async loadSourceCode(instanceId: number) {
    // Try emgithub.com first (works for public repos, better formatting)
    this.iframe.srcdoc = this.createSrcdocFromGithubLink(this.chosenInstance.link);

    // Set up fallback to backend API if emgithub fails (for private repos)
    setTimeout(async () => {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
      if (iframeDoc && (iframeDoc.body.innerText.includes('404') || iframeDoc.body.children.length === 0)) {
        // emgithub failed, fall back to backend API
        const sourceCodeData = await this.instanceService.getSourceCode(instanceId);
        if (sourceCodeData && sourceCodeData.sourceCode) {
          this.iframe.srcdoc = this.createSrcdocFromSourceCode(sourceCodeData.sourceCode, sourceCodeData.link);
        }
      }
    }, 2000); // Wait 2 seconds for emgithub to load
  }

  private createSrcdocFromSourceCode(sourceCode: string, githubLink: string): string {
    // Extract file extension for syntax highlighting
    const fileExtension = githubLink.split('.').pop()?.split('#')[0] || 'txt';
    const language = this.getLanguageFromExtension(fileExtension);

    // Create HTML with syntax highlighting using Prism.js
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet" />
        <style>
          body { margin: 0; padding: 10px; font-family: 'Consolas', 'Monaco', monospace; font-size: 14px; }
          pre { margin: 0; }
          .file-meta { background: #f5f5f5; padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="file-meta">${githubLink}</div>
        <pre><code class="language-${language}">${this.escapeHtml(sourceCode)}</code></pre>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
      </body>
      </html>
    `;
  }

  private getLanguageFromExtension(ext: string): string {
    const languageMap: { [key: string]: string } = {
      'cs': 'csharp',
      'java': 'java',
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'cpp': 'cpp',
      'c': 'c',
      'h': 'c',
      'hpp': 'cpp'
    };
    return languageMap[ext.toLowerCase()] || 'clike';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private countTotalCoupling() {
    this.chosenInstance.relatedInstances.forEach((instance) => {
      this.totalCouplingStrength.set(instance.id, 0);
      Object.entries(instance.couplingTypeAndStrength).forEach((coupling) => {
        this.totalCouplingStrength.set(instance.id, this.totalCouplingStrength.get(instance.id) + coupling[1]);
      });
    });
  }

  private createSrcdocFromGithubLink(githubLink: string): string {
    let completeLink =
      'https://emgithub.com/embed.js?target=' +
      encodeURIComponent(githubLink) +
      '&style=github&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on';
    return '<script src="' + completeLink + '"></script>';
  }

  public formatUrl(url: string): string {
    const hairSpace: string = '\u200a';
    url = url.split('_').join(`_${hairSpace}`);
    return url.split('.').join(`.${hairSpace}`);
  }

  public loadPreviousInstance() {
    this.notificationService.setEvent(
      new PreviousInstanceEvent(this.chosenInstance.id)
    );
  }

  public loadNextInstance() {
    this.notificationService.setEvent(
      new NextInstanceEvent(this.chosenInstance.id)
    );
  }

  @HostListener('window:keydown', ['$event'])
  public next(event: KeyboardEvent) {
    if (!this.chosenInstance.id) return;
    if (event.altKey && event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      this.loadNextInstance();
    } else if (event.altKey && event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      this.loadPreviousInstance();
    }
  }
}

@Pipe({ name: 'couplingDetails' })
export class CouplingDetailsPipe implements PipeTransform {
  transform(value: Map<number, number>): string {
    var result = '';
    Object.entries(value).forEach((coupling) => {
      result += coupling[0] + ': ' + coupling[1] + '\n';
    });
    return result;
  }
}

@Pipe({ name: 'className' })
export class ClassNamePipe implements PipeTransform {
  transform(instance: Instance): string {
    if (instance.type.toString() == '0') return instance.codeSnippetId.split('.').pop()!;
    var methodName = instance.codeSnippetId.split('(')[0].split('.').pop()!;
    if (instance.codeSnippetId.includes('()')) return methodName + '()';
    return methodName + '(...)';
  }
}

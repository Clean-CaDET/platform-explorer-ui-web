import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Params } from '@angular/router';
import { SnippetType } from 'src/app/modules/annotation-schema/model/enums/enums.model';
import { AnnotationSchemaService } from 'src/app/modules/annotation-schema/services/annotation-schema.service';
import { RelatedInstance } from 'src/app/modules/data-set/model/related-instance/related-instance.model';
import { InstanceService } from 'src/app/modules/data-set/services/instance.service';
import { LocalStorageService } from 'src/app/modules/data-set/services/shared/local-storage.service';
import { GraphDataService } from '../../services/graph-data.service';
import { GraphService } from '../../services/graph.service';
import { ClassGraphComponent } from '../class-graph/class-graph.component';
import { NeighboursGraphComponent } from '../neighbours-graph/neighbours-graph.component';
import { ProjectGraphComponent } from '../project-graph/project-graph.component';

@Component({
  selector: 'de-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.css'],
})
export class TabContainerComponent implements OnInit {
  @ViewChild('projectGraph') projectGraph!: ProjectGraphComponent;
  @ViewChild('classGraph') classGraph!: ClassGraphComponent;
  @ViewChild('neighboursGraph') neighboursGraph!: NeighboursGraphComponent;
  private projectId: string = '';

  constructor(private route: ActivatedRoute, private graphService: GraphService, private storageService: LocalStorageService,
    private annotationSchemaService: AnnotationSchemaService, private instanceService: InstanceService,
    private graphDataService: GraphDataService) {}

  ngOnInit(): void {}

  onChange(event: MatTabChangeEvent) {
    const tab = event.tab.textLabel;
    if (tab === 'Project Graph' && this.projectGraph) this.showProjectGraph();
    else if (tab === 'Class Graph') this.showClassGraph();
    else if (tab === 'Class Neighbours') this.showNeighboursGraph();
  }

  private showProjectGraph() {
    this.route.params.subscribe((params: Params) => {
      if (!this.projectLoaded(params['projectId'])) this.loadProjectGraph(params['projectId']);
    });
  }

  private showClassGraph() {
    this.classGraph.subscribeToMembers();
  }

  private showNeighboursGraph() {
    var smellFilter = this.storageService.getSmellFilter();
    if (smellFilter == null) return;
    this.annotationSchemaService.getCodeSmellDefinitionByName(smellFilter).subscribe(smellDefinition => {
      if (smellDefinition.snippetType == 0) this.showNeighboursGraphForClass();
      else this.showNeighboursGraphForMethod();
    });
  }

  private showNeighboursGraphForClass() {
    this.route.params.subscribe((params: Params) => {
      this.neighboursGraph.show(params['projectId'], params['instanceId'], SnippetType.Class);
    });
  }

  private showNeighboursGraphForMethod() {
    this.route.params.subscribe(async (params: Params) => {
      var method = await this.instanceService.getInstanceWithRelatedInstances(params['instanceId']);
      var methodClass = method.relatedInstances.find(i => i.relationType == '3');
      this.graphDataService.getGraphInstanceWithNeighboursExtended(Number(params['projectId']), methodClass!.codeSnippetId).then(instance => {
        this.updateRelatedInstances(instance, method);
        this.neighboursGraph.showGraphInstance(instance, SnippetType.Function);
      })
    });
  }

  private updateRelatedInstances(instance: any, method: any) {
    var updatedRelated: RelatedInstance[] = [];
    method.relatedInstances.forEach((methodRelated: RelatedInstance) => {
      var relatedInstance = instance.relatedInstances.find((i: any) => i.codeSnippetId == methodRelated.codeSnippetId);
      if (relatedInstance != null) {
        relatedInstance.couplingTypeAndStrength = methodRelated.couplingTypeAndStrength;
        relatedInstance.relationType = methodRelated.relationType;
        updatedRelated.push(relatedInstance);
      }
    });
    instance.relatedInstances = updatedRelated;
  }

  private projectLoaded(id: string): boolean {
    return this.projectId == id;
  }

  private loadProjectGraph(projectId: string) {
    this.graphService.initProjectGraph(Number(projectId));
    this.projectGraph.loadProjectGraph();
    this.projectId = projectId;
  }
}

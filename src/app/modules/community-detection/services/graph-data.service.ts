import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ServerCommunicationService } from "src/app/server-communication/server-communication.service";
import { GraphInstance } from "../../data-set/model/graph-instance/graph-instance.model";
import { ProjectNode } from "../model/project-node";

@Injectable({
    providedIn: 'root',
})
export class GraphDataService {
    
    private metricFeatures = new BehaviorSubject<Map<string, number>>(new Map());    
    metricFeatures$ = this.metricFeatures.asObservable();

    constructor(private serverCommunicationService: ServerCommunicationService) {}

    public setMetricFeatures(metricFeatures: Map<string, number>) {
        this.metricFeatures.next(metricFeatures);
    }

    public async getGraphInstanceWithNeighbours(projectId: number, instanceId: number): Promise<GraphInstance> {
        return await this.serverCommunicationService.getRequestAsync(`projects/${projectId}/instances/${instanceId}/graph`);
    }
    
    public async getGraphInstanceWithNeighboursExtended(projectId: number, instanceCodeSnippetId: string): Promise<GraphInstance> {
        return await this.serverCommunicationService.getRequestAsync(`projects/${projectId}/instances/${instanceCodeSnippetId}/graph-extended`);
    }

    public getGraphInstancesAndRelated(graphInstance: GraphInstance) {
        var instances = [];
        instances.push(graphInstance);
        graphInstance.relatedInstances.forEach(relatedInstance => {
          instances.push(relatedInstance);
        });
        return instances;
    }
    
    public setNodeGroups(graphInstance: GraphInstance, projectNodes: ProjectNode[]) {
        this.setMainNodeGroup(graphInstance, projectNodes);
        this.setRelatedNodeGroup(graphInstance, projectNodes);  
        this.setMultipleRelatedNodeGroup(graphInstance, projectNodes);
    }
    
    private setMainNodeGroup(graphInstance: GraphInstance, projectNodes: ProjectNode[]) {
        var mainNodeIndex = projectNodes.findIndex(n => n.fullName == graphInstance.codeSnippetId);
        var mainNode = projectNodes.find(n => n.fullName == graphInstance.codeSnippetId);
        mainNode!.group = 0;
        projectNodes[mainNodeIndex] = mainNode!;
    }
    
    private setRelatedNodeGroup(graphInstance: GraphInstance, projectNodes: ProjectNode[]) {
        graphInstance.relatedInstances.forEach(relatedInstance => {
          var relatedNodeIndex = projectNodes.findIndex(n => n.fullName == relatedInstance.codeSnippetId);
          var relatedNode = projectNodes.find(n => n.fullName == relatedInstance.codeSnippetId);
          if (relatedInstance.relationType == '0') relatedNode!.group = 1;
          else if (relatedInstance.relationType == '1') relatedNode!.group = 2;
          else if (relatedInstance.relationType == '2') relatedNode!.group = 3;
          relatedNode!.link = relatedInstance.link;
          projectNodes[relatedNodeIndex] = relatedNode!;
        });
    }
    
    private setMultipleRelatedNodeGroup(graphInstance: GraphInstance, projectNodes: ProjectNode[]) {
        var multipleRelatedInstanceIds = this.getMultipleRelatedInstanceIds(graphInstance);
        multipleRelatedInstanceIds.forEach(codeSnippetId => {
          var relatedNodeIndex = projectNodes.findIndex(n => n.fullName == codeSnippetId);
          var relatedNode = projectNodes.find(n => n.fullName == codeSnippetId);
          relatedNode!.group = 4;
          projectNodes[relatedNodeIndex] = relatedNode!;
        });
    }
    
    private getMultipleRelatedInstanceIds(graphInstance: GraphInstance) {
        var duplicateIds = graphInstance.relatedInstances
          .map(relatedInstance => relatedInstance.codeSnippetId)
          .filter((relatedInstance, i, ids) => ids.indexOf(relatedInstance) !== i)
        var duplicates = graphInstance.relatedInstances
          .filter(instance => duplicateIds.includes(instance.codeSnippetId));
        return [...new Set(duplicates.map(item => item.codeSnippetId))];
    }
    
    public removeDuplicateNodes(projectNodes: ProjectNode[]) {
        projectNodes = projectNodes.filter((node, index, self) =>
          index === self.findIndex((t) => (
            t.fullName === node.fullName
          ))
        )
    }
}
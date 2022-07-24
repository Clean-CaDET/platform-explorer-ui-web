import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ServerCommunicationService } from "src/app/server-communication/server-communication.service";
import { GraphInstance } from "../../data-set/model/graph-instance/graph-instance.model";
import { GroupType } from "../model/enums/enums.model";
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
        mainNode!.group = GroupType.Main.toString();
        projectNodes[mainNodeIndex] = mainNode!;
    }
    
    private setRelatedNodeGroup(graphInstance: GraphInstance, projectNodes: ProjectNode[]) {
        graphInstance.relatedInstances.forEach(relatedInstance => {
          var relatedNodeIndex = projectNodes.findIndex(n => n.fullName == relatedInstance.codeSnippetId);
          var relatedNode = projectNodes.find(n => n.fullName == relatedInstance.codeSnippetId);
          if (relatedInstance.relationType == '0') relatedNode!.group = GroupType.Referenced.toString();
          else if (relatedInstance.relationType == '1') relatedNode!.group = GroupType.References.toString();
          else if (relatedInstance.relationType == '2') relatedNode!.group = GroupType.Parent.toString();
          relatedNode!.link = relatedInstance.link;
          projectNodes[relatedNodeIndex] = relatedNode!;
        });
    }
    
    private setMultipleRelatedNodeGroup(graphInstance: GraphInstance, projectNodes: ProjectNode[]) {
        var multipleRelatedInstances = this.getMultipleRelatedInstances(graphInstance);
        multipleRelatedInstances.forEach((value, key) => {
          var relatedNodeIndex = projectNodes.findIndex(n => n.fullName == key);
          var relatedNode = projectNodes.find(n => n.fullName == key);
          if (value.includes(GroupType.Parent) && value.includes(GroupType.Referenced)) {
            relatedNode!.group = GroupType.ParentAndReferenced;
          } else if (value.includes(GroupType.Parent) && value.includes(GroupType.References)) {
            relatedNode!.group = GroupType.ParentAndReferences;
          } else if (value.includes(GroupType.Referenced) && value.includes(GroupType.References)) {
            relatedNode!.group = GroupType.ReferencedAndReferences;
          }
          projectNodes[relatedNodeIndex] = relatedNode!;
        });
    }
    
    private getMultipleRelatedInstances(graphInstance: GraphInstance): Map<string, GroupType[]> {
        var duplicateIds = graphInstance.relatedInstances
          .map(relatedInstance => relatedInstance.codeSnippetId)
          .filter((relatedInstance, i, ids) => ids.indexOf(relatedInstance) !== i)
        var duplicates = graphInstance.relatedInstances
          .filter(instance => duplicateIds.includes(instance.codeSnippetId));

        var result: Map<string, GroupType[]> = new Map<string, GroupType[]>();
        duplicates.forEach(duplicate => {
          if (!result.has(duplicate.codeSnippetId)) result.set(duplicate.codeSnippetId, []);
          if (duplicate.relationType == '2') {
            var types = result.get(duplicate.codeSnippetId);
            types?.push(GroupType.Parent);
            result.set(duplicate.codeSnippetId, types!);
          } else if (duplicate.relationType == '1') {
            var types = result.get(duplicate.codeSnippetId);
            types?.push(GroupType.References);
            result.set(duplicate.codeSnippetId, types!);
          } else if (duplicate.relationType == '0') {
            var types = result.get(duplicate.codeSnippetId);
            types?.push(GroupType.Referenced);
            result.set(duplicate.codeSnippetId, types!);
          }
        });
        return result;
    }
    
    public removeDuplicateNodes(projectNodes: ProjectNode[]) {
      projectNodes = projectNodes.filter(node => {
        return node.group != '0' && node.group != '1' && node.group != '2';
      })
      return projectNodes;
    }
}
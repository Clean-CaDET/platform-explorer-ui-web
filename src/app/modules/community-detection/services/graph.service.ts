import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Link } from '../model/link';
import { ProjectNode } from '../model/project-node';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import { GraphInstance } from '../../data-set/model/graph-instance/graph-instance.model';
import { GraphRelatedInstance } from '../../data-set/model/graph-related-instance/graph-related-instance.model';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service';
import { ClassGraph } from '../model/class-graph';
import { ClassGraphField } from '../model/class-graph-field';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  private projectClasses = new Subject<GraphInstance[]>();
  private classMembers = new BehaviorSubject<ClassGraph>({});
  private className = new BehaviorSubject<string>('');

  projectClasses$ = this.projectClasses.asObservable();
  classMembers$ = this.classMembers.asObservable();
  className$ = this.className.asObservable();

  constructor(private serverCommunicationService: ServerCommunicationService){}

  public initProjectGraph(projectId: number) {
    this.serverCommunicationService.getRequest(`projects/${projectId}/graph`).subscribe(project => {
      this.projectClasses.next(project.graphInstances);
    });
  }

  public getClassGraph(instanceId: number): Observable<ClassGraph> {
    return this.serverCommunicationService.getRequest(`instances/${instanceId}/class-cohesion-graph`);
  }

  //   getCommunities(nodes: any, links: any, algorithm: string) {
  //   return this.http.post(`${environment.apiHost}projects/community-detection`, {
  //     Nodes: nodes.map((n:any) => n.id),
  //     Links: links,
  //     Algorithm: algorithm,
  //   });
  // }

  

  public initClassGraph(classGraph: ClassGraph, className: string) {
    this.classMembers.next(classGraph);
    this.className.next(this.getClassNameFromPath(className));
  }

  private getClassNameFromPath(fullName: string) {
    const paths = fullName.split('.');
    return paths[paths.length - 1];
  }

  public getGraphFromClassGraph(classGraph: ClassGraph): Graph {
    let methods = this.getMethods(classGraph);
    let fields = this.getFields(classGraph[methods[0]]);
    let nodes = this.getNodes(methods, fields);
    let links = this.getLinks(classGraph);
    let graph: Graph = new Graph();
    for (let node of nodes) {
      try {
        graph.addNode(node);
      } catch (exception) {}
    }
    for (let link of links) {
      try {
        graph.addEdge(link[0], link[1]);
      } catch (exception) {}
    }
    return graph;
  }

  private getMethods(classGraph: ClassGraph): string[] {
    return Object.keys(classGraph);
  }

  private getFields(classGraphFields: ClassGraphField): string[] {
    try {
      return Object.keys(classGraphFields);
    } catch (exception: any) {
      return [];
    }
  }

  private getNodes(methods: string[], fields: string[]): string[] {
    return [...new Set([...methods, ...fields])];
  }

  private getLinks(classGraph: ClassGraph) {
    let links: [string, string][] = [];
    for (let method in classGraph) {
      let source: string = method;
      for (let field in classGraph[method]) {
        if (classGraph[method][field] === true) {
          links.push([source, field]);
        }
      }
    }
    return links;
  }

  public getCommunities(graph: Graph) {
    try {
      return louvain(graph);
    } catch (exception: any) {
      return graph.nodes().map((node: string) => {
        let ret: any = {};
        ret[node] = 0;
        return ret;
      });
    }
  }

  public getNodesFromGraph(graph: Graph, communities: any): ProjectNode[] {
    return graph.nodes().map((node: string) => {
      return {
        id: node,
        fullName: node,
        group: communities[node],
        link: node
      };
    });
  }

  public getLinksFromGraph(graph: Graph): Link[] {
    let links: Link[] = [];
    graph.forEachEdge((edge) => {
      links.push({ source: graph.source(edge), target: graph.target(edge), weight: 10 });
    });
    return links;
  }

  public getExistingLinksFromGraph(graph: Graph, projectLinks: Link[]) {
    let links: Link[] = [];
    graph.forEachEdge((edge: any) => {
      let source = graph.source(edge);
      let target = graph.target(edge);
      let foundLink = projectLinks.find((l: Link) => source === l.source && target === l.target);
      if (foundLink) {
        links.push(foundLink);
      }
    });
    return links;
  }

  public getGraphBasedOnData(instances: GraphInstance[]) {
    let graph = new Graph();
    let projectNodes = this.extractNodesFromInstances(instances);
    let projectLinks = this.extractLinksFromInstances(instances);
    projectNodes.forEach((node: ProjectNode) => {
      try {
        graph.addNode(node.id);
      } catch (exception) {}
    });
    let distinctLinks: Link[] = [];
    projectLinks.forEach((link: Link) => {
      if (distinctLinks.findIndex((l: Link) => link.source === l.source && link.target === l.target) === -1) {
        try {
          graph.addEdge(link.source, link.target);
          distinctLinks.push(link);
        } catch (exception) {}
      }
    });
    return { projectNodes, projectLinks, graph, distinctLinks };
  }

  private extractNodesFromInstances(instances: GraphInstance[]): ProjectNode[] {
    return instances.map((instance: GraphInstance) => {
      return {
        id: this.getClassNameFromPath(instance.codeSnippetId),
        fullName: instance.codeSnippetId,
        group: 0,
        link: instance.link
      };
    });
  }

  private extractLinksFromInstances(instances: GraphInstance[]): Link[] {
    let links: Link[] = [];
    instances.forEach((instance: GraphInstance) => {
      if (instance.relatedInstances != undefined) {
        instance.relatedInstances.forEach((relatedInstance: GraphRelatedInstance) => {
          let weight = 0;
          let couplingStrength = relatedInstance.couplingTypeAndStrength as any;
          for (let key in couplingStrength) {
            weight += couplingStrength[key];
          }
          links.push({
            source: this.getClassNameFromPath(instance.codeSnippetId),
            target: this.getClassNameFromPath(relatedInstance.codeSnippetId),
            weight: weight
          });
        });
      }
    });
    return links;
  }

  public loadSubGraph(node: string, graph: Graph) {
    let subGraph = new Graph();
    subGraph.addNode(node);
    let firstLevelNeighbours = graph.neighbors(node);
    for (let neighbour of firstLevelNeighbours) {
      subGraph.addNode(neighbour);
      subGraph.addEdge(node, neighbour);
    }
    for (let neighbour of firstLevelNeighbours) {
      for (let secondLevelNeighbour of graph.neighbors(neighbour)) {
        if (!subGraph.hasNode(secondLevelNeighbour)) subGraph.addNode(secondLevelNeighbour);
        subGraph.addEdge(neighbour, secondLevelNeighbour);
      }
    }
    return subGraph;
  }
}

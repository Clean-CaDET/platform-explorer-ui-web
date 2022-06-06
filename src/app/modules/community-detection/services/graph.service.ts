import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataSetProject } from '../../data-set/model/data-set-project/data-set-project.model';
import { Instance } from '../../data-set/model/instance/instance.model';
import { RelatedInstance } from '../../data-set/model/related-instance/related-instance.model';
import { Link } from '../model/link';
import { ProjectNode } from '../model/project-node';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CohesionGraph } from '../model/cohesion-graph';
import { CohesionGraphField } from '../model/cohesion-graph-field';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  private projectClasses = new Subject<Instance[]>();
  private classMembers = new BehaviorSubject<CohesionGraph>({});
  private metricFeatures = new BehaviorSubject<Map<string, number>>(new Map());

  projectClasses$ = this.projectClasses.asObservable();
  classMembers$ = this.classMembers.asObservable();
  metricFeatures$ = this.metricFeatures.asObservable();

  constructor(private http: HttpClient) {}

  setMetricFeatures(metricFeatures: Map<string, number>) {
    this.metricFeatures.next(metricFeatures);
  }

  getCohesionGraph(instanceId: number): Observable<CohesionGraph> {
    return this.http.get<CohesionGraph>(`${environment.apiHost}instances/${instanceId}/cohesion-graph`);
  }

  getCommunities(nodes: any, links: any, algorithm: string) {
    return this.http.post(`${environment.apiHost}projects/community-detection`, {
      Nodes: nodes,
      Links: links,
      Algorithm: algorithm,
    });
  }

  initProjectGraph(project: DataSetProject) {
    this.projectClasses.next(project.candidateInstances[0].instances);
  }

  extractNodesFromInstances(instances: Instance[]): ProjectNode[] {
    return instances.map((instance: Instance) => {
      return {
        id: this.extractClassNameFromPath(instance.codeSnippetId),
        fullName: instance.codeSnippetId,
        group: 0,
      };
    });
  }

  extractClassNameFromPath(fullName: string) {
    const paths = fullName.split('.');
    return paths[paths.length - 1];
  }

  extractLinksFromInstances(instances: Instance[]): Link[] {
    let links: Link[] = [];
    instances.forEach((instance: Instance) => {
      instance.relatedInstances.forEach((relatedInstance: RelatedInstance) => {
        let weight = 0;
        let couplingStrength = relatedInstance.couplingTypeAndStrength as any;
        for (let key in couplingStrength) {
          weight += couplingStrength[key];
        }
        links.push({
          source: this.extractClassNameFromPath(instance.codeSnippetId),
          target: this.extractClassNameFromPath(relatedInstance.codeSnippetId),
          weight: weight,
        });
      });
    });
    return links;
  }

  initClassGraph(classGraph: CohesionGraph) {
    this.classMembers.next(classGraph);
  }

  extractGraph(cohesionGraph: CohesionGraph): Graph {
    let methods = this.extractMethods(cohesionGraph);
    let fields = this.extractFields(cohesionGraph[methods[0]]);
    let nodes = this.extractNodes(methods, fields);
    let links = this.extractLinks(cohesionGraph);
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

  extractCommunities(graph: Graph) {
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

  extractMethods(cohesionGraph: CohesionGraph): string[] {
    return Object.keys(cohesionGraph);
  }

  extractFields(cohesionGraphFields: CohesionGraphField): string[] {
    try {
      return Object.keys(cohesionGraphFields);
    } catch (exception: any) {
      return [];
    }
  }

  extractNodes(methods: string[], fields: string[]): string[] {
    return [...new Set([...methods, ...fields])];
  }

  extractLinks(cohesionGraph: CohesionGraph) {
    let links: [string, string][] = [];
    for (let method in cohesionGraph) {
      let source: string = method;
      for (let field in cohesionGraph[method]) {
        if (cohesionGraph[method][field] === true) {
          links.push([source, field]);
        }
      }
    }
    return links;
  }

  extractNodesFromGraph(graph: Graph, communities: any): ProjectNode[] {
    return graph.nodes().map((node: string) => {
      return {
        id: node,
        fullName: node,
        group: communities[node],
      };
    });
  }

  extractLinksFromGraph(graph: Graph): Link[] {
    let links: Link[] = [];
    graph.forEachEdge((edge) => {
      links.push({ source: graph.source(edge), target: graph.target(edge), weight: 10 });
    });
    return links;
  }

  extractExistingLinksFromFullGraph(subGraph: Graph, projectLinks: Link[]) {
    let links: Link[] = [];
    subGraph.edges().forEach((edge: any) => {
      let source = subGraph.source(edge);
      let target = subGraph.target(edge);
      let foundLink = projectLinks.find((l: Link) => source === l.source && target === l.target);
      if (foundLink) {
        links.push(foundLink);
      }
    });
    return links;
  }
}

import { Component, OnInit } from '@angular/core';
import Graph from 'graphology';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { GraphService } from '../../services/graph.service';
import { D3CommunityGraph } from '../../model/d3-community-graph';
import { Subscription } from 'rxjs';
import { GraphInstance } from 'src/app/modules/data-set/model/graph-instance/graph-instance.model';

@Component({
  selector: 'de-class-graph-neighbours',
  templateUrl: './class-graph-neighbours.component.html',
  styleUrls: ['./class-graph-neighbours.component.css'],
})
export class ClassGraphNeighboursComponent implements OnInit {
  width: number = 0;
  height: number = 0;
  classNameSubscription!: Subscription;
  svg: any;
  D3CommunityGraph!: D3CommunityGraph;
  graph: Graph;
  subGraph: Graph;
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];
  initialProjectLinks: Link[] = [];

  constructor(private graphService: GraphService) {
    this.graph = new Graph();
    this.subGraph = new Graph();
  }

  ngOnInit(): void {
    this.loadProjectGraph();
  }

  initGraph() {
    const nodesToDraw = this.nodesToDraw();
    const linksToDraw = this.linksToDraw();
    this.initSvg();
    this.D3CommunityGraph = new D3CommunityGraph({
      width: this.width,
      height: this.height,
      radius: 35,
      color: d3.scaleOrdinal(d3.schemeCategory20),
    });
    this.D3CommunityGraph.initGraph(this.svg, linksToDraw, nodesToDraw, false);
  }

  initSvg() {
    document.getElementById('classGraphNeighboursSvg')?.remove();
    this.svg = d3
      .select('#classGraphNeighbours')
      .append('svg')
      .attr('id', 'classGraphNeighboursSvg')
      .attr('width', '100%')
      .attr('height', 1300);
    this.width = this.svg.node().getBoundingClientRect().width;
    this.height = this.svg.node().getBoundingClientRect().height;
  }

  loadProjectGraph() {
    this.graphService.projectClasses$.subscribe((instances: GraphInstance[]) => {
      let ret = this.graphService.loadGraph(instances);
      this.projectNodes = ret.projectNodes;
      this.graph = ret.graph;
      this.initialProjectLinks = ret.distinctLinks;
      this.projectLinks = ret.distinctLinks;
      this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
    });
  }

  show(projectId: string, instanceId: string) {
    this.graphService.getGraphInstanceWithNeighbours(Number(projectId), Number(instanceId)).then(graphInstance => {
      var graphData = this.graphService.loadGraph(this.getGraphInstancesAndRelated(graphInstance));
      this.projectNodes = graphData.projectNodes;
      this.setNodeGroups(graphInstance);
      this.removeDuplicateNodes();
      this.projectLinks = graphData.projectLinks;
      this.initGraph();
    })
  }

  private getGraphInstancesAndRelated(graphInstance: GraphInstance) {
    var instances = [];
    instances.push(graphInstance);
    graphInstance.relatedInstances.forEach(relatedInstance => {
      instances.push(relatedInstance);
    });
    return instances;
  }

  private setNodeGroups(graphInstance: GraphInstance) {
    this.setMainNodeGroup(graphInstance);
    this.setRelatedNodeGroup(graphInstance);  
    this.setMultipleRelatedNodeGroup(graphInstance);
  }

  private setMainNodeGroup(graphInstance: GraphInstance) {
    var mainNodeIndex = this.projectNodes.findIndex(n => n.fullName == graphInstance.codeSnippetId);
    var mainNode = this.projectNodes.find(n => n.fullName == graphInstance.codeSnippetId);
    mainNode!.group = 0;
    this.projectNodes[mainNodeIndex] = mainNode!;
  }

  private setRelatedNodeGroup(graphInstance: GraphInstance) {
    graphInstance.relatedInstances.forEach(relatedInstance => {
      var relatedNodeIndex = this.projectNodes.findIndex(n => n.fullName == relatedInstance.codeSnippetId);
      var relatedNode = this.projectNodes.find(n => n.fullName == relatedInstance.codeSnippetId);
      if (relatedInstance.relationType == '0') relatedNode!.group = 1;
      else if (relatedInstance.relationType == '1') relatedNode!.group = 2;
      else if (relatedInstance.relationType == '2') relatedNode!.group = 3;
      this.projectNodes[relatedNodeIndex] = relatedNode!;
    });
  }

  private setMultipleRelatedNodeGroup(graphInstance: GraphInstance) {
    var multipleRelatedInstanceIds = this.getMultipleRelatedInstanceIds(graphInstance);
    multipleRelatedInstanceIds.forEach(codeSnippetId => {
      var relatedNodeIndex = this.projectNodes.findIndex(n => n.fullName == codeSnippetId);
      var relatedNode = this.projectNodes.find(n => n.fullName == codeSnippetId);
      relatedNode!.group = 4;
      this.projectNodes[relatedNodeIndex] = relatedNode!;
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

  private removeDuplicateNodes() {
    this.projectNodes = this.projectNodes.filter((node, index, self) =>
      index === self.findIndex((t) => (
        t.fullName === node.fullName
      ))
    )
  }

  nodesToDraw(): ProjectNode[] {
    return _.cloneDeep(this.projectNodes);
  }

  linksToDraw(subLinks?: Link[] | null): Link[] {
    return _.cloneDeep(this.projectLinks);
  }
}

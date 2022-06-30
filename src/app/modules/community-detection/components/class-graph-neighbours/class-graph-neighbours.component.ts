import { Component, OnInit } from '@angular/core';
import Graph from 'graphology';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Instance } from 'src/app/modules/data-set/model/instance/instance.model';
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
      this.projectLinks = ret.projectLinks;
      this.graph = ret.graph;
      this.projectLinks = ret.distinctLinks;
      this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
    });
  }

  subscribeToClassNeighbours() {
    this.classNameSubscription = this.graphService.className$.subscribe((className: string) => {
      this.subGraph = this.graphService.loadSubGraph(className, this.graph);
      this.communities = this.graphService.extractCommunities(this.subGraph);
      this.projectNodes = this.graphService.extractNodesFromGraph(this.subGraph, this.communities);
      this.projectLinks = this.graphService.extractExistingLinksFromFullGraph(this.subGraph, this.projectLinks);
      this.initGraph();
    });
  }

  nodesToDraw(): ProjectNode[] {
    return _.cloneDeep(this.projectNodes);
  }

  linksToDraw(subLinks?: Link[] | null): Link[] {
    return _.cloneDeep(this.projectLinks);
  }

  otherAlgorithms(algorithm: string) {
    const nodes = this.projectNodes.map((node: ProjectNode) => node.fullName);
    const links = this.projectLinks.map((link: Link) => {
      return { source: link.source, target: link.target };
    });
    this.graphService.getCommunities(nodes, links, algorithm).subscribe((data: any) => {
      this.communities = data;
      this.projectNodes = this.graphService.extractNodesFromGraph(this.subGraph, this.communities);
      this.initGraph();
    });
  }

  louvain() {
    this.communities = this.graphService.extractCommunities(this.subGraph);
    this.projectNodes = this.graphService.extractNodesFromGraph(this.subGraph, this.communities);
    console.log(this.projectNodes);
    this.initGraph();
  }
}

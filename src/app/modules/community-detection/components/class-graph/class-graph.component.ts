import { Component, OnInit } from '@angular/core';
import Graph from 'graphology';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { CohesionGraph } from '../../model/cohesion-graph';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { D3ForcedGraphService } from '../../services/d3-forced-graph.service';
import { GraphService } from '../../services/graph.service';
import { Observable, Subscription } from 'rxjs';
import { MetricFeature } from '../../model/metric-feature';

@Component({
  selector: 'de-class-graph',
  templateUrl: './class-graph.component.html',
  styleUrls: ['./class-graph.component.css'],
})
export class ClassGraphComponent implements OnInit {
  svg: any;
  width: number = 0;
  height: number = 0;
  simulation: any;
  color: any;
  links: any;
  nodes: any;
  circles: any;
  labels: any;
  radius: number = 35;
  graph: Graph
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];
  metricFeatures: MetricFeature[] = [];
  graphSubscription!: Subscription;
  metricFeaturesSubscription!: Subscription;
  displayedColumns: string[] = ['feature', 'value'];

  constructor(private graphService: GraphService, private d3ForcedGraphService: D3ForcedGraphService) {
    this.color = d3.scaleOrdinal(d3.schemeCategory20);
    this.graph = new Graph();
  }

  ngOnInit(): void {}

  initGraph() {
    const nodesToDraw = this.nodesToDraw();
    const linksToDraw = this.linksToDraw();
    document.getElementById('classSvg')?.remove();
    this.svg = d3.select('#classGraph').append('svg').attr('id', 'classSvg').attr('width', '100%').attr('height', 1000);
    this.width = this.svg.node().getBoundingClientRect().width;
    this.height = this.svg.node().getBoundingClientRect().height;
    this.simulation = this.d3ForcedGraphService.initSimulation(
      this.width,
      this.height,
      nodesToDraw,
      linksToDraw
    );
    this.links = this.d3ForcedGraphService.initLinks(this.color, this.svg, linksToDraw);
    this.nodes = this.d3ForcedGraphService.initNodes(this.svg, nodesToDraw);
    this.circles = this.d3ForcedGraphService.initCircles(
      this.nodes,
      this.color,
      this.simulation,
      this.radius,
      this.width,
      this.height
    );
    this.labels = this.d3ForcedGraphService.initLabeles(this.nodes);
    this.d3ForcedGraphService.initTitle(this.nodes);
    this.d3ForcedGraphService.startSimulation(
      this.simulation,
      nodesToDraw,
      linksToDraw,
      this.links,
      this.circles,
      this.labels,
      this.radius,
      this.width,
      this.height
    );
  }

  subscribeToMembers() {
    this.graphSubscription = this.graphService.classMembers$.subscribe((cohesionGraph: CohesionGraph) => {
      this.graph = this.graphService.extractGraph(cohesionGraph);
      this.communities = this.graphService.extractCommunities(this.graph);
      this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
      this.projectLinks = this.graphService.extractLinksFromGraph(this.graph);
      this.initGraph();
    });
    this.metricFeaturesSubscription = this.graphService.metricFeatures$.subscribe(
      (metricFeatures: Map<string, number>) => {
        let newFeatures: MetricFeature[] = [];
        for (let [key, value] of metricFeatures) {
          newFeatures.push({
            feature: key,
            value: value,
          });
        }
        this.metricFeatures = newFeatures;
      }
    );
  }

  nodesToDraw(): ProjectNode[] {
    return _.cloneDeep(this.projectNodes);
  }

  linksToDraw(): Link[] {
    return _.cloneDeep(this.projectLinks);
  }

  otherAlgorithms(algorithm: string) {
    const nodes = this.projectNodes.map((node: ProjectNode) => node.fullName);
    const links = this.projectLinks.map((link: Link) => { return { 'source': link.source, 'target': link.target } });
    this.graphService.getCommunities(nodes, links, algorithm).subscribe((data: any) => {
      this.communities = data;
      this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
      this.initGraph();
    })
  }

  louvain() {
    this.communities = this.graphService.extractCommunities(this.graph);
    this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
    this.initGraph();
  }

  showFullGraph() {
    this.communities = this.graphService.extractCommunities(this.graph);
    this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
    this.initGraph();
  }
}

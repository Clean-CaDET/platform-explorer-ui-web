import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import Graph from 'graphology';
import { Instance } from 'src/app/modules/data-set/model/instance/instance.model';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { D3ForcedGraphService } from '../../services/d3-forced-graph.service';
import { GraphService } from '../../services/graph.service';

@Component({
  selector: 'de-project-graph',
  templateUrl: './project-graph.component.html',
  styleUrls: ['./project-graph.component.css'],
})
export class ProjectGraphComponent implements OnInit {
  svg: any;
  g: any;
  zoom: any;
  width: number = 0;
  height: number = 0;
  simulation: any;
  color: any;
  links: any;
  nodes: any;
  circles: any;
  labels: any;
  radius: number = 10;
  graph: Graph;
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];

  constructor(private graphService: GraphService, private d3ForcedGraphService: D3ForcedGraphService) {
    this.color = d3.scaleOrdinal(d3.schemeCategory20);
    this.graph = new Graph();
  }

  ngOnInit(): void {
    this.loadProjectGraph();
  }

  initGraph(subNodes?: ProjectNode[] | null, subLinks?: Link[] | null) {
    const nodesToDraw = this.nodesToDraw(subNodes);
    const linksToDraw = this.linksToDraw(subLinks);
    if (subNodes) this.initSvg(true);
    else this.initSvg(false);
    if (!subNodes) this.initZoom();
    this.simulation = this.d3ForcedGraphService.initSimulation(this.width, this.height, nodesToDraw, linksToDraw);
    if (!subNodes) this.calculatePositionsWithoutDrawing();
    this.links = this.d3ForcedGraphService.initLinks(this.color, this.g, linksToDraw);
    this.nodes = this.d3ForcedGraphService.initNodes(this.g, nodesToDraw);
    this.initNodeClick(this.nodes);
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
    if (!subNodes) this.d3ForcedGraphService.zoomFit(this.g, this.svg, this.zoom);
    if (subNodes)
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

  initSvg(forSubGraph: boolean) {
    document.getElementById('projectSvg')?.remove();
    this.svg = d3
      .select('#projectGraph')
      .append('svg')
      .attr('id', 'projectSvg')
      .attr('width', '100%')
      .attr('height', forSubGraph ? 1700 : 2000);
    this.g = this.svg.append('g').attr('id', 'projectG');
    this.width = forSubGraph ? this.svg.node().getBoundingClientRect().width : 5000;
    this.height = forSubGraph ? this.svg.node().getBoundingClientRect().height : 4000;
  }

  initZoom() {
    this.zoom = d3.zoom().on('zoom', () => {
      this.g.attr('transform', d3.event.transform);
    });
    this.svg.call(this.zoom);
  }

  nodesToDraw(subNodes?: ProjectNode[] | null): ProjectNode[] {
    return subNodes ? _.cloneDeep(subNodes) : _.cloneDeep(this.projectNodes);
  }

  linksToDraw(subLinks?: Link[] | null): Link[] {
    return subLinks ? _.cloneDeep(subLinks) : _.cloneDeep(this.projectLinks);
  }

  calculatePositionsWithoutDrawing() {
    for (let i = 0; i < 350; ++i) this.simulation.tick();
    this.simulation.stop();
  }

  loadProjectGraph() {
    this.graphService.projectClasses$.subscribe((instances: Instance[]) => {
      this.graph = new Graph();
      this.projectNodes = this.graphService.extractNodesFromInstances(instances);
      this.projectLinks = this.graphService.extractLinksFromInstances(instances);
      this.projectNodes.forEach((node: ProjectNode) => {
        this.graph.addNode(node.id);
      });
      let distinctLinks: Link[] = [];
      this.projectLinks.forEach((link: Link) => {
        if (distinctLinks.findIndex((l: Link) => link.source === l.source && link.target === l.target) === -1) {
          distinctLinks.push(link);
          this.graph.addEdge(link.source, link.target);
        }
      });
      this.projectLinks = distinctLinks;
      this.communities = this.graphService.extractCommunities(this.graph);
      this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
    });
  }

  initNodeClick(nodes: any) {
    nodes.on('click', (d: any) => {
      this.initSubGraph(d.id);
    });
  }

  initSubGraph(node: string) {
    let subGraph = new Graph();
    subGraph.addNode(node);
    let firstLevelNeighbours = this.graph.neighbors(node);
    for (let neighbour of firstLevelNeighbours) {
      subGraph.addNode(neighbour);
      subGraph.addEdge(node, neighbour);
    }
    for (let neighbour of firstLevelNeighbours) {
      for (let secondLevelNeighbour of this.graph.neighbors(neighbour)) {
        if (!subGraph.hasNode(secondLevelNeighbour)) subGraph.addNode(secondLevelNeighbour);
        subGraph.addEdge(neighbour, secondLevelNeighbour);
      }
    }
    const subNodes = this.graphService.extractNodesFromGraph(subGraph, this.communities);
    const subLinks = this.graphService.extractExistingLinksFromFullGraph(subGraph, this.projectLinks);
    this.initGraph(subNodes, subLinks);
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

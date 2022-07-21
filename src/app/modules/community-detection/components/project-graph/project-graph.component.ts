import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import Graph from 'graphology';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { D3ForcedGraphService } from '../../services/d3-forced-graph.service';
import { GraphService } from '../../services/graph.service';
import { D3CommunityGraph } from '../../model/d3-community-graph';
import { GraphInstance } from 'src/app/modules/data-set/model/graph-instance/graph-instance.model';

@Component({
  selector: 'de-project-graph',
  templateUrl: './project-graph.component.html',
  styleUrls: ['./project-graph.component.css'],
})
export class ProjectGraphComponent {
  svg: any;
  g: any;
  zoom: any;
  width: number = 0;
  height: number = 0;
  D3CommunityGraph!: D3CommunityGraph;
  graph: Graph;
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];

  constructor(private graphService: GraphService, private d3ForcedGraphService: D3ForcedGraphService) {
    this.graph = new Graph();
  }

  initGraph(subNodes?: ProjectNode[] | null, subLinks?: Link[] | null) {
    const nodesToDraw = this.nodesToDraw(subNodes);
    const linksToDraw = this.linksToDraw(subLinks);
    if (subNodes) this.initSvg(true);
    else this.initSvg(false);
    if (!subNodes) this.initZoom();
    this.D3CommunityGraph = new D3CommunityGraph({
      width: this.width,
      height: this.height,
      radius: 35,
      color: d3.scaleOrdinal(d3.schemeCategory20),
    });
    this.D3CommunityGraph.initGraph(this.g, linksToDraw, nodesToDraw, !subNodes);
    this.initNodeClick(this.D3CommunityGraph.nodes);
    if (!subNodes) this.d3ForcedGraphService.zoomFit(this.g, this.svg, this.zoom);
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

  loadProjectGraph() {
    this.graphService.projectClasses$.subscribe((instances: GraphInstance[]) => {
      let ret = this.graphService.loadGraph(instances);
      this.projectNodes = ret.projectNodes;
      this.projectLinks = ret.projectLinks;
      this.graph = ret.graph;
      this.projectLinks = ret.distinctLinks;
      this.communities = this.graphService.extractCommunities(this.graph);
      this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
      this.initGraph();
    });
  }

  initNodeClick(nodes: any) {
    nodes.on('click', (d: any) => {
      this.initSubGraph(d.id);
    });
  }

  initSubGraph(node: string) {
    let subGraph = this.graphService.loadSubGraph(node, this.graph);
    const subNodes = this.graphService.extractNodesFromGraph(subGraph, this.communities);
    const subLinks = this.graphService.extractExistingLinksFromFullGraph(subGraph, this.projectLinks);
    this.initGraph(subNodes, subLinks);
  }

  showFullGraph() {
    this.communities = this.graphService.extractCommunities(this.graph);
    this.projectNodes = this.graphService.extractNodesFromGraph(this.graph, this.communities);
    this.initGraph();
  }
}

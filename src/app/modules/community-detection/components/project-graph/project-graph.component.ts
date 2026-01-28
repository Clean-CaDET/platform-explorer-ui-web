import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import Graph from 'graphology';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { GraphService } from '../../services/graph.service';
import { GraphInstance } from 'src/app/modules/data-set/model/graph-instance/graph-instance.model';
import { NotificationService } from 'src/app/modules/data-set/services/shared/notification.service';
import { D3GraphService } from '../../services/d3-graph.service';

@Component({
    selector: 'de-project-graph',
    templateUrl: './project-graph.component.html',
    styleUrls: ['./project-graph.component.css'],
    standalone: false
})
export class ProjectGraphComponent {
  svg: any;
  g: any;
  zoom: any;
  width: number = 0;
  height: number = 0;
  graph: Graph;
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];

  constructor(private graphService: GraphService,
    private d3GraphService: D3GraphService) {
    this.graph = new Graph();
  }

  initGraph(subNodes?: ProjectNode[] | null, subLinks?: Link[] | null) {
    const nodesToDraw = this.nodesToDraw(subNodes);
    const linksToDraw = this.linksToDraw(subLinks);
    if (subNodes) this.initSvg(true);
    else this.initSvg(false);
    if (!subNodes) this.initZoom();
    this.d3GraphService.setAttributes({
      width: this.width,
      height: this.height,
      radius: 35,
      color: d3.scaleOrdinal(d3.schemeCategory20),
    });
    this.d3GraphService.initGraph(this.g, linksToDraw, nodesToDraw, !subNodes, false);
    this.initNodeClick(this.d3GraphService.nodes);
    if (!subNodes) this.d3GraphService.zoomFit(this.g, this.svg, this.zoom);
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
      let graph = this.graphService.getGraphBasedOnData(instances);
      this.projectNodes = graph.projectNodes;
      this.projectLinks = graph.projectLinks;
      this.graph = graph.graph;
      this.projectLinks = graph.distinctLinks;
      this.communities = this.graphService.getCommunities(this.graph);
      this.projectNodes = this.graphService.getNodesFromGraph(this.graph, this.communities);
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
    const subNodes = this.graphService.getNodesFromGraph(subGraph, this.communities);
    const subLinks = this.graphService.getExistingLinksFromGraph(subGraph, this.projectLinks);
    this.initGraph(subNodes, subLinks);
  }

  showFullGraph() {
    this.communities = this.graphService.getCommunities(this.graph);
    this.projectNodes = this.graphService.getNodesFromGraph(this.graph, this.communities);
    this.initGraph();
  }
}

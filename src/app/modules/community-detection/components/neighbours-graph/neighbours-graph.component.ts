import { Component } from '@angular/core';
import Graph from 'graphology';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { GraphService } from '../../services/graph.service';
import { Subscription } from 'rxjs';
import { D3GraphService } from '../../services/d3-graph.service';
import { GraphDataService } from '../../services/graph-data.service';

@Component({
  selector: 'de-neighbours-graph',
  templateUrl: './neighbours-graph.component.html',
  styleUrls: ['./neighbours-graph.component.css'],
})
export class NeighboursGraphComponent {
  width: number = 0;
  height: number = 0;
  classNameSubscription!: Subscription;
  svg: any;
  graph: Graph;
  subGraph: Graph;
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];
  initialProjectLinks: Link[] = [];

  constructor(private graphService: GraphService, private graphDataService: GraphDataService,
    private d3GraphService: D3GraphService) {
    this.graph = new Graph();
    this.subGraph = new Graph();
  }

  initGraph() {
    const nodesToDraw = this.nodesToDraw();
    const linksToDraw = this.linksToDraw();
    this.initSvg();
    this.d3GraphService.setAttributes({
      width: this.width,
      height: this.height,
      radius: 35,
      color: d3.scaleOrdinal(d3.schemeCategory20),
    });
    this.d3GraphService.initGraph(this.svg, linksToDraw, nodesToDraw, false);
  }

  initSvg() {
    document.getElementById('neighboursGraph')?.remove();
    this.svg = d3
      .select('#neighboursGraph')
      .append('svg')
      .attr('id', 'neighboursGraph')
      .attr('width', '100%')
      .attr('height', 1300);
    this.width = this.svg.node().getBoundingClientRect().width;
    this.height = this.svg.node().getBoundingClientRect().height;
  }

  show(projectId: string, instanceId: string) {
    this.graphDataService.getGraphInstanceWithNeighbours(Number(projectId), Number(instanceId)).then(graphInstance => {
      var graph = this.graphService.getGraphBasedOnData(this.graphDataService.getGraphInstancesAndRelated(graphInstance));
      this.projectNodes = graph.projectNodes;
      this.graphDataService.setNodeGroups(graphInstance, this.projectNodes);
      this.graphDataService.removeDuplicateNodes(this.projectNodes);
      this.projectLinks = graph.projectLinks;
      this.initGraph();
    })
  }

  nodesToDraw(): ProjectNode[] {
    return _.cloneDeep(this.projectNodes);
  }

  linksToDraw(subLinks?: Link[] | null): Link[] {
    return _.cloneDeep(this.projectLinks);
  }
}
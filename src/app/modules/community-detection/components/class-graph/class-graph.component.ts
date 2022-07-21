import { Component, OnInit } from '@angular/core';
import Graph from 'graphology';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { CohesionGraph } from '../../model/cohesion-graph';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { GraphService } from '../../services/graph.service';
import { Subscription } from 'rxjs';
import { MetricFeature } from '../../model/metric-feature';
import { D3CommunityGraph } from '../../model/d3-community-graph';

@Component({
  selector: 'de-class-graph',
  templateUrl: './class-graph.component.html',
  styleUrls: ['./class-graph.component.css'],
})
export class ClassGraphComponent implements OnInit {
  svg: any;
  D3CommunityGraph!: D3CommunityGraph;
  graph: Graph;
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];
  metricFeatures: MetricFeature[] = [];
  graphSubscription!: Subscription;
  metricFeaturesSubscription!: Subscription;
  displayedColumns: string[] = ['feature', 'value'];

  constructor(private graphService: GraphService) {
    this.graph = new Graph();
  }

  ngOnInit(): void {}

  initGraph() {
    const nodesToDraw = this.nodesToDraw();
    const linksToDraw = this.linksToDraw();
    document.getElementById('classSvg')?.remove();
    this.svg = d3.select('#classGraph').append('svg').attr('id', 'classSvg').attr('width', '100%').attr('height', 1000);
    this.D3CommunityGraph = new D3CommunityGraph({
      width: this.svg.node().getBoundingClientRect().width,
      height: this.svg.node().getBoundingClientRect().height,
      radius: 35,
      color: d3.scaleOrdinal(d3.schemeCategory20),
    });
    this.D3CommunityGraph.initGraph(this.svg, linksToDraw, nodesToDraw, false);
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
}

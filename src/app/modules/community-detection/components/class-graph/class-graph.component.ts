import { Component } from '@angular/core';
import Graph from 'graphology';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Link } from '../../model/link';
import { ProjectNode } from '../../model/project-node';
import { GraphService } from '../../services/graph.service';
import { Subscription } from 'rxjs';
import { MetricFeature } from '../../model/metric-feature';
import { D3GraphService } from '../../services/d3-graph.service';
import { GraphDataService } from '../../services/graph-data.service';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'de-class-graph',
    templateUrl: './class-graph.component.html',
    styleUrls: ['./class-graph.component.css'],
    standalone: true,
  imports: [
      MatTableModule
  ]
})
export class ClassGraphComponent {
  svg: any;
  graph: Graph;
  communities: any = {};
  projectNodes: ProjectNode[] = [];
  projectLinks: Link[] = [];
  metricFeatures: MetricFeature[] = [];
  graphSubscription!: Subscription;
  metricFeaturesSubscription!: Subscription;
  displayedColumns: string[] = ['feature', 'value'];

  constructor(private graphService: GraphService,
    private d3GraphService: D3GraphService, private graphDataService: GraphDataService) {
    this.graph = new Graph();
  }

  initGraph() {
    const nodesToDraw = this.nodesToDraw();
    const linksToDraw = this.linksToDraw();
    document.getElementById('classSvg')?.remove();
    this.svg = d3.select('#classGraph').append('svg').attr('id', 'classSvg').attr('width', '100%').attr('height', 1000);
    this.d3GraphService.setAttributes({
      width: this.svg.node().getBoundingClientRect().width,
      height: this.svg.node().getBoundingClientRect().height,
      radius: 35,
      color: d3.scaleOrdinal(d3.schemeCategory20),
    });
    this.d3GraphService.initGraph(this.svg, linksToDraw, nodesToDraw, false, false);
  }

  subscribeToMembers() {
    // this.graphSubscription = this.graphService.classMembers$.subscribe((classGraph: ClassGraph) => {
    //   this.graph = this.graphService.getGraphFromClassGraph(classGraph);
    //   this.communities = this.graphService.getCommunities(this.graph);
    //   this.projectNodes = this.graphService.getNodesFromGraph(this.graph, this.communities);
    //   this.projectLinks = this.graphService.getLinksFromGraph(this.graph);
    //   this.initGraph();
    // });
    this.metricFeaturesSubscription = this.graphDataService.metricFeatures$.subscribe(
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

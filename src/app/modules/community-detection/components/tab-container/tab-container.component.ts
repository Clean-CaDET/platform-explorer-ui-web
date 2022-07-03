import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Params } from '@angular/router';
import { GraphService } from '../../services/graph.service';
import { ClassGraphNeighboursComponent } from '../class-graph-neighbours/class-graph-neighbours.component';
import { ClassGraphComponent } from '../class-graph/class-graph.component';
import { ProjectGraphComponent } from '../project-graph/project-graph.component';

@Component({
  selector: 'de-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.css'],
})
export class TabContainerComponent implements OnInit {
  @ViewChild('projectGraph') projectGraph!: ProjectGraphComponent;
  @ViewChild('classGraph') classGraph!: ClassGraphComponent;
  @ViewChild('classGraphNeighbours') classGraphNeighbours!: ClassGraphNeighboursComponent;
  private projectId: string = '';

  constructor(private route: ActivatedRoute, private graphService: GraphService) {}

  ngOnInit(): void {}

  onChange(event: MatTabChangeEvent) {
    const tab = event.tab.textLabel;
    if (tab === 'Project Graph' && this.projectGraph) {
      this.route.params.subscribe(async (params: Params) => {
        if (this.projectId != params['projectId']) {
          this.graphService.initProjectGraph(params['projectId']);
          this.projectGraph.loadProjectGraph();
          this.projectId = params['projectId'];
        }
      });
    } else if (tab === 'Class Graph') {
      this.classGraph.subscribeToMembers();
    } else if (tab === 'Class Neighbours') {
      this.classGraphNeighbours.subscribeToClassNeighbours();
    }
  }
}

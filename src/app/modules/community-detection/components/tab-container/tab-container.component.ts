import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Params } from '@angular/router';
import { GraphService } from '../../services/graph.service';
import { ClassGraphComponent } from '../class-graph/class-graph.component';
import { NeighboursGraphComponent } from '../neighbours-graph/neighbours-graph.component';
import { ProjectGraphComponent } from '../project-graph/project-graph.component';

@Component({
  selector: 'de-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.css'],
})
export class TabContainerComponent implements OnInit {
  @ViewChild('projectGraph') projectGraph!: ProjectGraphComponent;
  @ViewChild('classGraph') classGraph!: ClassGraphComponent;
  @ViewChild('neighboursGraph') neighboursGraph!: NeighboursGraphComponent;
  private projectId: string = '';

  constructor(private route: ActivatedRoute, private graphService: GraphService) {}

  ngOnInit(): void {}

  onChange(event: MatTabChangeEvent) {
    const tab = event.tab.textLabel;
    if (tab === 'Project Graph' && this.projectGraph) {
      this.route.params.subscribe((params: Params) => {
        if (!this.projectLoaded(params['projectId'])) this.loadProjectGraph(params['projectId']);
      });
    } else if (tab === 'Class Graph') {
      this.classGraph.subscribeToMembers();
    } else if (tab === 'Class Neighbours') {
      this.route.params.subscribe((params: Params) => {
        this.neighboursGraph.show(params['projectId'], params['instanceId']);
      });
    }
  }

  private projectLoaded(id: string): boolean {
    return this.projectId == id;
  }

  private loadProjectGraph(projectId: string) {
    this.graphService.initProjectGraph(Number(projectId));
    this.projectGraph.loadProjectGraph();
    this.projectId = projectId;
  }
}

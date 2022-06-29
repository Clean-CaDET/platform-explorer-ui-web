import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
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

  constructor() {}

  ngOnInit(): void {}

  onChange(event: MatTabChangeEvent) {
    const tab = event.tab.textLabel;
    if (tab === 'Project Graph' && this.projectGraph) {
      if (!this.projectGraph.svg) {
        this.projectGraph.initGraph();
      }
    } else if (tab === 'Class Graph') {
      this.classGraph.subscribeToMembers();
    } else if (tab === 'Class Neighbours') {
      this.classGraphNeighbours.subscribeToClassNeighbours();
    }
  }
}

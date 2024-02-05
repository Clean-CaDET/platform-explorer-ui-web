import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { DataSetModule } from '../data-set/data-set.module';
import { DeviceRoutes } from './community-detection.routes';
import { TabContainerComponent } from './components/tab-container/tab-container.component';
import { ProjectGraphComponent } from './components/project-graph/project-graph.component';
import { ClassGraphComponent } from './components/class-graph/class-graph.component';
import { D3GraphService } from './services/d3-graph.service';
import { GraphService } from './services/graph.service';
import { NeighboursGraphComponent } from './components/neighbours-graph/neighbours-graph.component';
import { GraphDataService } from './services/graph-data.service';

@NgModule({
  declarations: [
    TabContainerComponent, 
    ProjectGraphComponent, 
    ClassGraphComponent, 
    NeighboursGraphComponent,
  ],
  imports: [
    MaterialModule,
    DataSetModule,
    RouterModule.forChild(DeviceRoutes)
  ],
  providers: [
    D3GraphService,
    GraphService,
    GraphDataService
  ],
  exports: [],
})
export class CommunityDetectionModule {}

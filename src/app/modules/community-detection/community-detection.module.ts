import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { DataSetModule } from '../data-set/data-set.module';
import { DeviceRoutes } from './community-detection.routes';
import { TabContainerComponent } from './components/tab-container/tab-container.component';
import { ProjectGraphComponent } from './components/project-graph/project-graph.component';
import { ClassGraphComponent } from './components/class-graph/class-graph.component';

@NgModule({
  declarations: [TabContainerComponent, ProjectGraphComponent, ClassGraphComponent],
  imports: [MaterialModule, DataSetModule, RouterModule.forChild(DeviceRoutes)],
  exports: [],
})
export class CommunityDetectionModule {}

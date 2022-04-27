import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/pages/login/login.component';
import { HomeComponent } from './modules/pages/home/home.component';
import { DataSetDetailComponent } from './modules/data-set/data-set-detail/data-set-detail.component';
import { DataSetComponent } from './modules/data-set/data-set.component';
import { AnnotationSchemaComponent } from './modules/annotation-schema/annotation-schema.component';
import { AnnotationContainerComponent } from './modules/data-set/annotation-container/annotation-container.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'annotation-schema', component: AnnotationSchemaComponent },
  { path: 'datasets', component: DataSetComponent },
  { path: 'datasets/:id', 
    component: DataSetDetailComponent,
    children: [
      { path: 'projects/:projectId/instances/:instanceId', component: AnnotationContainerComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

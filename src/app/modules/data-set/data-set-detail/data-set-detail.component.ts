import { Component, OnInit } from '@angular/core';
import { DataSet } from '../model/data-set/data-set.model';
import { DataSetProject } from '../model/data-set-project/data-set-project.model';
import { SmellCandidateInstances } from '../model/smell-candidate-instances/smell-candidate-instances.model';
import { InstanceFilter } from '../model/enums/enums.model';
import { Instance } from '../model/instance/instance.model';
import { Annotation } from '../model/annotation/annotation.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SessionStorageService } from 'src/app/session-storage.service';

@Component({
  selector: 'de-data-set-detail',
  templateUrl: './data-set-detail.component.html',
  styleUrls: ['./data-set-detail.component.css']
})

export class DataSetDetailComponent implements OnInit {

  public projectsToShow: DataSetProject[] = [];
  public chosenDataset: DataSet = new DataSet();
  public filter: InstanceFilter = InstanceFilter.All;
  public candidateInstances: SmellCandidateInstances[] = [];
  public panelOpenState = false;
  public showFiller = false;
  public automaticAnnotationMode = false;
  public instanceToAnnotate: Instance | undefined;
  public selectedSmell: string = '';
  public previousAnnotation: Annotation | undefined;
  public chosenProject: DataSetProject | undefined;
  public totalNumInstances: number = 0;
  public annotatedInstancesNum: number = 0;

  constructor(private route: ActivatedRoute, private sessionService: SessionStorageService) {}

  public ngOnInit() {
    this.route.params.subscribe((params: Params) => console.log('id:', params['id']));
  }

  private countAnnotatedInstances() {
    this.annotatedInstancesNum = 0;
    this.totalNumInstances = 0;
    this.chosenDataset.projects.forEach(project => {
      project.candidateInstances.forEach(candidates => {
        this.totalNumInstances += candidates.instances.length;
        candidates.instances.forEach(instance => {
          if (instance.annotations.find(a => a.annotator.id.toString() == this.sessionService.getLoggedInAnnotator())) {
            this.annotatedInstancesNum++;
          }
        });
      });
    });
  }

  public showProjects(dataSet: DataSet): void {
    if (dataSet) {
      this.projectsToShow = dataSet.projects;
    }
  }

  public newProjects(projects: DataSetProject[]): void {
    this.projectsToShow = projects;
    this.chosenDataset.projects = projects;
  }

  public newFilter(filter: InstanceFilter): void {
    this.filter = filter;
  }

  public newCandidates(candidates: SmellCandidateInstances[]): void {
    this.candidateInstances = candidates;
  }

  public chosenInstance(instance: Instance): void {
    this.instanceToAnnotate = instance;
  }

  public smellSelected(smell: string): void {
    this.selectedSmell = smell;
  }

  public previousAnnotated(annotation: Annotation): void {
    this.previousAnnotation = annotation; 
  }
  
  public async addAnnotation(annotation: Annotation): Promise<void> {
    this.instanceToAnnotate?.annotations.push(annotation);
    if (this.automaticAnnotationMode) this.loadNextInstanceForAnnotation();
    this.countAnnotatedInstances();
  }

  public loadNextInstanceForAnnotation() {
    var allInstances = this.getInstancesFromAllProjects();
    var i = 0;
    allInstances.forEach((instance: Instance) => {
      if (instance.id == this.instanceToAnnotate?.id && i < allInstances.length-1) {
        this.instanceToAnnotate = allInstances[i+1];
        this.candidateInstances = this.projectsToShow.find(p => p.url == this.instanceToAnnotate?.projectLink)?.candidateInstances!;
        this.chosenProject = this.projectsToShow.find(p => p.url == this.instanceToAnnotate?.projectLink);
        if (this.instanceToAnnotate.hasAnnotationFromLoggedUser) {
          this.previousAnnotation = this.instanceToAnnotate.annotationFromLoggedUser!;
        } else {
          this.previousAnnotation = undefined;
        }
        return;
      }
      i++;
    });
  }

  private getInstancesFromAllProjects(): Instance[] {
    var allInstances: Instance[] = [];
    this.projectsToShow.forEach(project => {
      project.candidateInstances.forEach(candidates => {
        if (candidates.codeSmell?.name==this.selectedSmell) {
          candidates.instances.forEach(instance => {
            allInstances.push(instance);
          });
        }
      });
    });
    return allInstances;
  }

  public async changeAnnotation(annotation: Annotation) {
    var i = this.instanceToAnnotate?.annotations.findIndex(a => a.id == annotation.id)!;
    if (i != -1) this.instanceToAnnotate!.annotations[i] = annotation;
    if (this.automaticAnnotationMode) this.loadNextInstanceForAnnotation();
  }

  public loadPreviousInstance() {
    var allInstances = this.getInstancesFromAllProjects();
    var i = 0;
    allInstances.forEach((instance: Instance) => {
      if (instance.id == this.instanceToAnnotate?.id && i > 0) {
        this.instanceToAnnotate = allInstances[i-1];
        this.candidateInstances = this.projectsToShow.find(p => p.url == this.instanceToAnnotate?.projectLink)?.candidateInstances!;
        this.chosenProject = this.projectsToShow.find(p => p.url == this.instanceToAnnotate?.projectLink);
        if (this.instanceToAnnotate.hasAnnotationFromLoggedUser) {
          this.previousAnnotation = this.instanceToAnnotate.annotationFromLoggedUser!;
        } else {
          this.previousAnnotation = undefined;
        }
        return;
      }
      i++;
    });
  }
}

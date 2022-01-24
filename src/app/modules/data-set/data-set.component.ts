import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataSet } from './model/data-set/data-set.model';
import { DataSetProject } from './model/data-set-project/data-set-project.model';
import { AddDataSetDialogComponent } from './dialogs/add-data-set-dialog/add-data-set-dialog.component';

import { DataSetService } from './data-set.service';
import { ExportDraftDataSetDialogComponent } from './dialogs/export-draft-data-set-dialog/export-draft-data-set-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { DialogConfigService } from './dialogs/dialog-config.service';
import { SmellCandidateInstances } from './model/smell-candidate-instances/smell-candidate-instances.model';
import { InstanceFilter } from './model/enums/enums.model';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { UpdateDataSetDialogComponent } from './dialogs/update-data-set-dialog/update-data-set-dialog.component';
import { Instance } from './model/instance/instance.model';
import { Annotation } from './model/annotation/annotation.model';
import { Router } from '@angular/router';

@Component({
  selector: 'de-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.css']
})

export class DataSetComponent implements OnInit {

  private dataSets: DataSet[] = [];
  public projectsToShow: DataSetProject[] = [];
  public displayedColumns = ['name', 'numOfProjects', 'dataSetExport', 'dataSetUpdate', 'dataSetDelete'];
  public dataSource = new MatTableDataSource<DataSet>(this.dataSets);
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

  private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  constructor(private dialog: MatDialog, private dataSetService: DataSetService, private toastr: ToastrService, private router: Router) {}

  public async ngOnInit(): Promise<void> {
    this.dataSets = await this.dataSetService.getAllDataSets();
    this.dataSource.data = this.dataSets;
    this.automaticDatasetSelection();
  }

  private automaticDatasetSelection() {
    if (this.dataSets.length > 0) {
      this.chosenDataset = this.dataSets[0];
      this.projectsToShow = this.chosenDataset.projects;
      this.countAnnotatedInstances();
      sessionStorage.setItem('codeSmellFilter', this.chosenDataset.projects[0]!.candidateInstances[0]!.codeSmell?.name!);
    }
  }

  private countAnnotatedInstances() {
    this.annotatedInstancesNum = 0;
    this.totalNumInstances = 0;
    this.chosenDataset.projects.forEach(project => {
      project.candidateInstances.forEach(candidates => {
        this.totalNumInstances += candidates.instances.length;
        candidates.instances.forEach(instance => {
          if (instance.annotations.find(a => a.annotator.id.toString() == sessionStorage.getItem('annotatorId'))) {
            this.annotatedInstancesNum++;
          }
        });
      });
    });
  }

  public addDataSet(): void {
    let dialogConfig = DialogConfigService.setDialogConfig('300px', '300px');
    let dialogRef = this.dialog.open(AddDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res: DataSet) => this.addEmptyDataSet(res));
  }

  public searchDataSets(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.dataSets.filter(s => s.name.toLowerCase().includes(input.toLowerCase()));
  }

  public showProjects(dataSet: DataSet): void {
    if (dataSet) {
      this.updateDataSets(dataSet);
      this.projectsToShow = dataSet.projects;
    }
  }

  private updateDataSets(dataSet: DataSet): void {
    let i = this.dataSets.findIndex(s => s.id == dataSet.id);
    this.dataSets[i] = dataSet;
    this.dataSource.data = this.dataSets;
  }

  private addEmptyDataSet(dataSet: DataSet): void {
    if (dataSet) {
      this.dataSets.push(dataSet);
      this.dataSource.data = this.dataSets;
    }
  }

  public chooseDataset(dataset: DataSet): void {
    this.chosenDataset = dataset;
    this.projectsToShow = dataset.projects;
    this.candidateInstances = [];
    sessionStorage.setItem('codeSmellFilter', this.chosenDataset.projects[0]!.candidateInstances[0]!.codeSmell?.name!);
    sessionStorage.setItem('changeView', 'true');
    this.countAnnotatedInstances();
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
  
  public exportDraftDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px');
    let dialogRef = this.dialog.open(ExportDraftDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((exportPath: string) => {
      if (exportPath == '') return;
      this.dataSetService.exportDraftDataSet(dataSet.id, exportPath).subscribe(res => {
        let result = new Map(Object.entries(res));
        this.toastr.success(result.get('successes')[0]['message']);
      });
    });
  }

  public deleteDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('150px', '300px');
    let dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.dataSetService.deleteDataSet(dataSet.id).subscribe(deleted => {
        this.dataSets.splice(this.dataSets.findIndex(d => d.id == dataSet.id), 1);
        this.dataSource.data = this.dataSets;
        if (this.chosenDataset.id == dataSet.id) this.projectsToShow = [];
        this.automaticDatasetSelection();
      });
    });
  }

  public updateDataSet(dataSet: DataSet): void {
    let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px', dataSet);
    let dialogRef = this.dialog.open(UpdateDataSetDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((updated: DataSet) => {
      if (updated) this.toastr.success('Updated dataset ' + updated.name);
    });
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

  public logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}

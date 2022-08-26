import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { AddProjectDialogComponent } from "../dialogs/add-project-dialog/add-project-dialog.component";
import { AnnotationConsistencyDialogComponent } from "../dialogs/annotation-consistency-dialog/annotation-consistency-dialog.component";
import { ConfirmDialogComponent } from "../dialogs/confirm-dialog/confirm-dialog.component";
import { DialogConfigService } from "../dialogs/dialog-config.service";
import { UpdateProjectDialogComponent } from "../dialogs/update-project-dialog/update-project-dialog.component";
import { DataSetProject } from "../model/data-set-project/data-set-project.model";
import { DataSet } from "../model/data-set/data-set.model";
import { ProjectState } from "../model/enums/enums.model";
import { DataSetProjectService } from "../services/data-set-project.service";
import { LocalStorageService } from "../services/shared/local-storage.service";
import { DatasetChosenEvent, InstanceChosenEvent, NotificationEvent, NotificationService, ProjectChosenEvent } from "../services/shared/notification.service";

@Component({
    selector: 'de-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css']
})
  
export class ProjectsComponent implements OnInit {

    public chosenDataset: DataSet = new DataSet();
    public chosenProject: DataSetProject = new DataSetProject();
    public dataSource: MatTableDataSource<DataSetProject> = new MatTableDataSource<DataSetProject>(this.chosenDataset.projects);
    public displayedColumns: string[] = ['name', 'url', 'numOfInstances', 'status', 'actions'];
    public basicInfoColumns: string[] = ['name', 'url', 'numOfInstances', 'status', 'actions'];
    public annotationInfoColumns: string[] = ['name', 'url', 'numOfInstances', 'fullyAnnotated', 'consistency', 'status', 'actions'];
    private pollingCycleDurationInSeconds: number = 10;
    public instancesFilters = ["All instances", "Need additional annotations", "With disagreeing annotations"];
    public filterFormControl: FormControl = new FormControl('All instances', [Validators.required]);
    public projectState = ProjectState;
    public showAnnotationInfo: boolean = false;

    private notificationSubscription: Subscription | undefined;

    @ViewChild(MatTable) public table : MatTable<DataSetProject>;
    private paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
    @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
        this.dataSource.paginator = this.paginator;
    }

    constructor(private dialog: MatDialog, private projectService: DataSetProjectService,
        private toastr: ToastrService, private notificationService: NotificationService,
        private storageService: LocalStorageService) {
    }

    ngOnInit(): void {
      this.showAnnotationInfo = false;
      this.notificationSubscription = this.notificationService.getEvent()
        .subscribe(async (event: NotificationEvent) => {
            if (event instanceof DatasetChosenEvent) {
              this.chosenDataset = event.dataset;
              this.dataSource.data = this.chosenDataset.projects;
            } else if (event instanceof InstanceChosenEvent) {
              this.chosenProject = new DataSetProject(await this.projectService.getProject(event.instance.projectId));
            }
        });
    }
    
    ngOnDestroy(): void {
      this.notificationSubscription?.unsubscribe();
    }

    public addProject(): void {
        let dialogConfig = DialogConfigService.setDialogConfig('480px', '520px', this.chosenDataset.id);// auto
        let dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((project: DataSetProject) => {
          if (project) {
            project.state = ProjectState.Processing;
            this.chosenDataset.projectsCount = this.chosenDataset.projects.length;
            this.dataSource.data = this.chosenDataset.projects;
            this.dataSource.data.push(project);
            this.table.renderRows();
            this.startPollingProjects();
          }
        });
    }

    private startPollingProjects(): void {
        let secondsToWait: number = 0;
        for (let project of this.chosenDataset.projects.filter(p => p.state == ProjectState.Processing)) {
          this.pollDataSetProjectAsync(project, secondsToWait++);
        }
    }

    private async pollDataSetProjectAsync(dataSetProject: DataSetProject, secondsToWait: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000 * secondsToWait));
        while (dataSetProject.state == ProjectState.Processing) {
          await new Promise(resolve => setTimeout(resolve, 1000 * this.pollingCycleDurationInSeconds));
          dataSetProject = new DataSetProject(await this.projectService.getProject(dataSetProject.id));
        }
        this.updateProjects(dataSetProject);
    }

    private updateProjects(dataSetProject: DataSetProject): void {
        let i = this.chosenDataset.projects.findIndex(p => p.id == dataSetProject.id);
        this.chosenDataset.projects[i] = dataSetProject;
        this.dataSource.data = this.chosenDataset.projects;
    }

    public async chooseProject(id: number) {
        this.chosenProject = new DataSetProject(await this.projectService.getProject(id));
        this.notificationService.setEvent(new ProjectChosenEvent({project: this.chosenProject, filter: this.filterFormControl.value}));
    }

    public updateProject(project: DataSetProject): void {
        let dialogConfig = DialogConfigService.setDialogConfig('250px', '300px', project);//auto
        let dialogRef = this.dialog.open(UpdateProjectDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((updated: DataSetProject) => {
          if (updated) this.toastr.success('Updated project ' + updated.name);
        });
    }

    public deleteProject(id: number): void {
        let dialogRef = this.dialog.open(ConfirmDialogComponent);
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed) this.projectService.deleteDataSetProject(id).subscribe(deleted => {
            this.chosenDataset.projects.splice(this.chosenDataset.projects.findIndex(p => p.id == deleted.id), 1);
            this.dataSource.data = this.chosenDataset.projects;
          });
        });
    }

    public searchProjects(event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        this.dataSource.data = this.chosenDataset.projects.filter(p => p.name.toLowerCase().includes(input.toLowerCase()));
    }

    public checkConsistency(projectId: number): void {
        let dialogConfig = DialogConfigService.setDialogConfig('auto', 'auto', { data: [projectId, this.storageService.getSmellFilter()]});
        this.dialog.open(AnnotationConsistencyDialogComponent, dialogConfig);
    }

    public toggleAnnotationInfo() {
      if (this.showAnnotationInfo) this.displayedColumns = this.basicInfoColumns;     
      else this.displayedColumns = this.annotationInfoColumns;
    }
}
import { DataSetProject } from "../data-set-project/data-set-project.model";
import { ProjectSummaryDTO } from "../DTOs/project-summary-dto/project-summary-dto.model";

export class DataSet {
    id: number = 0;
    name: string = '';
    projects: DataSetProject[] = [];
    instancesCount: number = 0;
    projectsCount: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.instancesCount = obj.instancesCount;
            this.projectsCount = obj.projectsCount;
            obj.projects.forEach((project: ProjectSummaryDTO)=> {
                this.projects.push(new DataSetProject({id: project.id, name: project.name, url: project.url, state: project.state, instancesCount: project.instancesCount, fullyAnnotated: 0}));
            });
        }
    }
}

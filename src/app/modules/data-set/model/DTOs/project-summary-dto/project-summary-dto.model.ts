import { ProjectState } from "../../enums/enums.model";

export class ProjectSummaryDTO {
    id: number = 0;
    name: string = '';
    url: string = '';
    state: ProjectState = ProjectState.Processing;
    instancesCount: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.url = obj.url;
            this.instancesCount = obj.instancesCount;
        }
    }
}

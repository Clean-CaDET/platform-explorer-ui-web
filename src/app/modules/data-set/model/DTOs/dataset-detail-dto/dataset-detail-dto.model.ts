import { DatasetSummaryDTO } from "../dataset-summary-dto/dataset-summary-dto.model";
import { ProjectSummaryDTO } from "../project-summary-dto/project-summary-dto.model";

export class DatasetDetailDTO extends DatasetSummaryDTO {
    instancesCount: number = 0;
    projects: ProjectSummaryDTO[] = [];

    constructor(obj?: any) {
        super(obj);
        if (obj) {
            this.instancesCount = obj.instancesCount;
            this.projects = obj.projects;
        }
    }
}

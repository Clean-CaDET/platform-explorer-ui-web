export class DatasetSummaryDTO {
    id: number = 0;
    name: string = '';
    projectsCount: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.projectsCount = obj.projectsCount;
        }
    }
}

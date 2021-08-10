import { DataSetProject } from "../data-set-project/data-set-project.model";

export class DataSet {
    id: number = 0;
    name: string = '';
    projects: DataSetProject[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.projects = obj.projects;
        }
    }
}

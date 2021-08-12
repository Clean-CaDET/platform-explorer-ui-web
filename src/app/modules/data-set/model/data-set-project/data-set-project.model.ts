import { DataSetInstance } from "../data-set-instance/data-set-instance.model";

export class DataSetProject {
    id: number = 0;
    name: string = '';
    url: string = '';
    instances: DataSetInstance[] = [];
    state: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.url = obj.url;
            this.instances = obj.instances;
            this.state = obj.state;
        }
    }
}

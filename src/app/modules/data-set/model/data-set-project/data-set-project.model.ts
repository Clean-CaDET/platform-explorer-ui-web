import { DataSetInstance } from "../data-set-instance/data-set-instance.model";
import { ProjectState } from "../enums/enums.model";

export class DataSetProject {
    id: number = 0;
    name: string = '';
    url: string = '';
    instances: DataSetInstance[] = [];
    state: ProjectState = ProjectState.Processing

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.url = obj.url;
            this.instances = obj.instances;
            this.setProjectState(obj.state);
        }
    }

    private setProjectState(state: number) {
        switch(state) { 
            case 0: {
                this.state = ProjectState.Processing;
                break;
            }
            case 1: { 
                this.state = ProjectState.Built;
                break; 
            } 
            case 2: { 
                this.state = ProjectState.Failed;
                break; 
            } 
        }
    }
}

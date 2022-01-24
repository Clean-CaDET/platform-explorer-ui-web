import { SmellCandidateInstances } from "../smell-candidate-instances/smell-candidate-instances.model";
import { ProjectState } from "../enums/enums.model";

export class DataSetProject {
    id: number = 0;
    name: string = '';
    url: string = '';
    candidateInstances: SmellCandidateInstances[] = [];
    state: ProjectState = ProjectState.Processing;
    fullyAnnotated: boolean = false;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.url = obj.url;
            this.candidateInstances = obj.candidateInstances;
            this.setProjectState(obj.state);
            this.fullyAnnotated = obj.fullyAnnotated;
        }
    }

    private setProjectState(state: string): void {
        switch(+state) { 
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
            default: {
                this.state = state as ProjectState;
                break;
            }
        }
    }

    public getTotalNumOfInstances(): number {
        if (this.candidateInstances == undefined) return 0;
        let total = 0;
        this.candidateInstances.forEach(candidate => {
            total += candidate.instances.length;
        });
        return total;
    }
}

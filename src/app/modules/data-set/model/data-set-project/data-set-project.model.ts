import { SmellCandidateInstances } from "../smell-candidate-instances/smell-candidate-instances.model";
import { ProjectState } from "../enums/enums.model";
import { Instance } from "../instance/instance.model";
import { GraphInstance } from "../graph-instance/graph-instance.model";

export class DataSetProject {
    id: number = 0;
    name: string = '';
    url: string = '';
    candidateInstances: SmellCandidateInstances[] = [];
    graphInstances: GraphInstance[] = [];
    state: ProjectState = ProjectState.Processing;
    fullyAnnotated: boolean = false;
    instancesCount: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.url = obj.url;
            this.candidateInstances = obj.candidateInstances;
            this.graphInstances = obj.graphInstances;
            this.setProjectState(obj.state);
            this.fullyAnnotated = obj.fullyAnnotated;
            this.countInstances(obj.instancesCount);
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

    private countInstances(instancesCount: any) {
        if (instancesCount == undefined && this.candidateInstances != undefined) {
            this.candidateInstances.forEach(candidate => {
                this.instancesCount += candidate.instances.length;
            });
        } else {
            this.instancesCount = instancesCount;
        }
    }

    public countAnnotatedInstances(): number {
        if (this.candidateInstances == undefined) return 0;
        var counter = 0;
        this.candidateInstances.forEach(candidate => {
            candidate.instances.forEach(instance => {
                if (instance.hasAnnotationFromLoggedUser) counter++;
            });
        });
        return counter;
    }

    public hasInstances(): boolean {
        return this.candidateInstances.length > 0 && this.candidateInstances[0].instances.length > 0;
    }

    public getCandidateInstancesForSmell(codeSmell: string | null): Instance[] {
        if (!codeSmell) return [];
        return this.candidateInstances.find(c => c.codeSmell?.name == codeSmell)?.instances!;
    }

    public getLastInstanceForSmell(codeSmell: string) {
        var candidateInstances = this.getCandidateInstancesForSmell(codeSmell);
        if (candidateInstances.length == 0) return null;
        else return candidateInstances[candidateInstances.length-1];
        
    }
}

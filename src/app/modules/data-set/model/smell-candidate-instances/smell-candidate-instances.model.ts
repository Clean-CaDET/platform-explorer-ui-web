import { CodeSmell } from "../code-smell/code-smell.model";
import { Instance } from "../instance/instance.model";

export class SmellCandidateInstances {
    id: number = 0;
    codeSmell: CodeSmell | undefined;
    instances: Instance[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSmell = obj.codeSmell;
            this.instances = obj.instances;
        }
    }
}

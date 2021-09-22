import { CodeSmell } from "../code-smell/code-smell.model";
import { DataSetInstance } from "../data-set-instance/data-set-instance.model";

export class CandidateDataSetInstance {
    id: number = 0;
    codeSmell: CodeSmell | undefined;
    instances: DataSetInstance[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSmell = obj.codeSmell;
            this.instances = obj.instances;
        }
    }
}

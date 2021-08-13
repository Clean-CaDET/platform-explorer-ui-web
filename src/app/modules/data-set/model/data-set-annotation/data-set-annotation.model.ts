import { SmellHeuristic } from "../smell-heuristic/smell-heuristic.model";

export class DataSetAnnotation {
    dataSetInstanceId: number = 0;
    severity: number = 0;
    codeSmell: string = '';
    applicableHeuristics: SmellHeuristic[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.dataSetInstanceId = obj.dataSetInstanceId;
            this.severity = obj.severity;
            this.codeSmell = obj.codeSmell;
            this.applicableHeuristics = obj.applicableHeuristics;
        }
    }
}

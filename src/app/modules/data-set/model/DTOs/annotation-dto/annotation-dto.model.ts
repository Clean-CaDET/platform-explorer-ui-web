import { SmellHeuristic } from "../../smell-heuristic/smell-heuristic.model";

export class AnnotationDTO {
    instanceId: number = 0;
    severity: string = '';
    codeSmell: string = '';
    applicableHeuristics: SmellHeuristic[] = [];
    note: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.instanceId = obj.instanceId;
            this.severity = obj.severity;
            this.codeSmell = obj.codeSmell;
            this.applicableHeuristics = obj.applicableHeuristics;
            this.note = obj.note;
        }
    }
}

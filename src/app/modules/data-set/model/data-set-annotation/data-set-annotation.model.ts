import { Annotator } from "../annotator/annotator.model";
import { CodeSmell } from "../code-smell/code-smell.model";
import { SmellHeuristic } from "../smell-heuristic/smell-heuristic.model";

export class DataSetAnnotation {
    id: number = 0;
    instanceSmell: CodeSmell = new CodeSmell();
    severity: number = 0;
    applicableHeuristics: SmellHeuristic[] = [];
    annotator: Annotator = new Annotator();

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.instanceSmell = obj.instanceSmell;
            this.severity = obj.severity;
            this.applicableHeuristics = obj.applicableHeuristics;
            this.annotator = obj.annotator;
        }
    }
}

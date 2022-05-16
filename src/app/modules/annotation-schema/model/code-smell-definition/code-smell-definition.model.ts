import { Heuristic } from "../heuristic/heuristic.model";

export class CodeSmellDefinition {
    id: number = 0;
    name: string = '';
    description: string = '';
    snippetType: string = '';
    severityValues: string[] = [];
    heuristics: Heuristic[] = [];
 
    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.description = obj.description;
            this.snippetType = obj.snippetType;
            this.severityValues = obj.severityValues;
            this.heuristics = obj.heuristics;
        }
    }
}

import { Heuristic } from "../heuristic/heuristic.model";
import { Severity } from "../severity/severity.model";

export class CodeSmellDefinition {
    id: number = 0;
    name: string = '';
    description: string = '';
    snippetType: string = '';
    severities: Severity[] = [];
    heuristics: Heuristic[] = [];
 
    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.description = obj.description;
            this.snippetType = obj.snippetType;
            this.severities = obj.severities;
            this.heuristics = obj.heuristics;
        }
    }
}

import { SeverityRange } from "../severity-range/severity-range.model";

export class CodeSmellDefinition {
    id: number = 0;
    name: string = '';
    description: string = '';
    snippetType: string = '';
    severityRange: SeverityRange = new SeverityRange();
    severityValues: string[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.description = obj.description;
            this.snippetType = obj.snippetType;
            this.severityRange = obj.severityRange;
            this.severityValues = obj.severityValues;
        }
    }
}

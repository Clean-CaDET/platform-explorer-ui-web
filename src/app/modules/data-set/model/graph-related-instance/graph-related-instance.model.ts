import { CouplingType } from "../enums/enums.model";

export class GraphRelatedInstance {
    id: number = 0;
    codeSnippetId: string = '';
    couplingTypeAndStrength: Map<CouplingType, number> = new Map();

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.couplingTypeAndStrength = obj.couplingTypeAndStrength;
        }
    }
}

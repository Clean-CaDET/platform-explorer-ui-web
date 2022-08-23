import { CouplingType, RelationType } from "../enums/enums.model";

export class GraphRelatedInstance {
    id: number = 0;
    codeSnippetId: string = '';
    relationType: string = '';
    couplingTypeAndStrength: Map<CouplingType, number> = new Map();
    link: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.setRelationType(obj.relationType);
            this.couplingTypeAndStrength = obj.couplingTypeAndStrength;
            this.link = obj.link;
        }
    }

    private setRelationType(type: string): void {
        switch(+type) {
            case 0: {
                this.relationType = RelationType.Referenced;
                break;
            }
            case 1: { 
                this.relationType = RelationType.References;
                break; 
            } 
            case 2: { 
                this.relationType = RelationType.Parent;
                break; 
            } 
            case 3: {
                this.relationType = RelationType.BelongsTo;
                break;
            }
            default: {
                this.relationType = type as RelationType;
                break;
            }
        }
    }
}

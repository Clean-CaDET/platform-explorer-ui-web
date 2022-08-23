import { CouplingType, RelationType } from "../enums/enums.model";

export class RelatedInstance {
    id: number = 0;
    codeSnippetId: string = '';
    link: string = '';
    relationType: string = '';
    couplingTypeAndStrength: Map<CouplingType, number> = new Map();

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.link = obj.link;
            this.setRelationType(obj.relationType);
            this.couplingTypeAndStrength = obj.couplingTypeAndStrength;
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

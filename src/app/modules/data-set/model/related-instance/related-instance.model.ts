import { RelationType } from "../enums/enums.model";

export class RelatedInstance {
    id: number = 0;
    codeSnippetId: string = '';
    link: string = '';
    relationType: string = '';
    couplingStrength: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.link = obj.link;
            this.setRelationType(obj.relationType);
            this.couplingStrength = obj.couplingStrength;
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
            default: {
                this.relationType = type as RelationType;
                break;
            }
        }
    }
}

import { InstanceType } from '../../enums/enums.model'

export class CodeSmellDTO {
    value: string = '';
    snippetTypes: InstanceType[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.value = obj.value;
            this.setSnippetTypes(obj.snippetTypes);
        }
    }

    private setSnippetTypes(types: string[]): void {
        types.forEach(t => this.snippetTypes.push(this.getSnippetType(t)));
    }

    private getSnippetType(type: string): InstanceType {
        switch(+type) { 
            case 0: {
                return InstanceType.Class;
            }
            case 1: { 
                return InstanceType.Method;
            } 
            default: {
                return type as InstanceType;
            }
        }
    }
}

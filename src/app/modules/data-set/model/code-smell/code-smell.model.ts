export class CodeSmell {
    name: string = '';
    snippetType: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.name = obj.name;
            this.snippetType = obj.snippetType;
        }
    }
}

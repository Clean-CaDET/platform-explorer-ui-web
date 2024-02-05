export class CodeSmell {
    name: string = '';
    snippetType: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.name = obj.name;
            this.snippetType = this.setSnippetType(obj.snippetType);
        }
    }

    private setSnippetType(snippetType: any) {
        if (snippetType == 0) {
            return 'Class';
        } else if (snippetType == 1) {
            return 'Function';
        } else {
            return snippetType;
        }
    }
}

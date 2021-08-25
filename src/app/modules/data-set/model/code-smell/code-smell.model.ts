export class CodeSmell {
    value: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.value = obj.value;
        }
    }
}

export class Severity {
    id: number = 0;
    value: string = '';
    description: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.value = obj.value;
            this.description = obj.description;
        }
    }
}

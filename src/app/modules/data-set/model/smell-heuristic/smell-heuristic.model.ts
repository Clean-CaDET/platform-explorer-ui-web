export class SmellHeuristic {
    description: string = '';
    isApplicable: boolean = true;
    reasonForApplicability: string = '';

    constructor(obj?: any) {
        this.description = obj.description;
        this.isApplicable = obj.isApplicable;
        this.reasonForApplicability = obj.reasonForApplicability;
    }
}

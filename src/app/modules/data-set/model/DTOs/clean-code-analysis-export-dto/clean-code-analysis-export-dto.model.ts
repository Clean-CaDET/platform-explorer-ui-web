export class CleanCodeAnalysisDTO {
    cleanCodeOptions: string[];

    constructor(obj?: any) {
        if (obj) {
            this.cleanCodeOptions = obj.cleanCodeOptions;
        }
    }
}

export class CleanCodeAnalysisDTO {
    exportPath: string;
    cleanCodeOptions: string[];

    constructor(obj?: any) {
        if (obj) {
            this.exportPath = obj.exportPath;
            this.cleanCodeOptions = obj.cleanCodeOptions;
        }
    }
}

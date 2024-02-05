export class CompleteDataSetExportDTO {
    annotationsPath: string;
    exportPath: string;

    constructor(obj?: any) {
        if (obj) {
            this.annotationsPath = obj.annotationsPath;
            this.exportPath = obj.exportPath;
        }
    }
}

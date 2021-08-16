import { DataSetAnnotation } from "../data-set-annotation/data-set-annotation.model"; 

export class DataSetInstance {
    id: number = 0;
    codeSnippetId: string = '';
    link: string = '';
    projectLink: string = '';
    type: number = 0;
    annotations: DataSetAnnotation[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.link = obj.link;
            this.projectLink = obj.projectLink;
            this.type = obj.type;
            this.annotations = obj.annotations;
        }
    }
}

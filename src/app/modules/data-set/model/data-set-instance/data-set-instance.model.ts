import { DataSetAnnotation } from "../data-set-annotation/data-set-annotation.model"; 
import { InstancesType } from "../enums/enums.model";

export class DataSetInstance {
    id: number = 0;
    codeSnippetId: string = '';
    link: string = '';
    projectLink: string = '';
    type: number = 0;
    annotations: DataSetAnnotation[] = [];
    hasAnnotationFromLoggedUser: boolean = false;
    annotationFromLoggedUser: DataSetAnnotation | null = null;

    constructor(obj?: any, annotatorId?: number) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.link = obj.link;
            this.projectLink = obj.projectLink;
            this.type = obj.type;
            this.annotations = obj.annotations;
            this.setAnnotationFromLoggedUser(annotatorId);
        }
    }

    private setAnnotationFromLoggedUser(annotatorId: number = +sessionStorage.getItem('annotatorID')!): void {
        this.annotationFromLoggedUser = this.annotations.filter(a => a.annotator.id == annotatorId)[0];
        if (this.annotationFromLoggedUser) {
            this.hasAnnotationFromLoggedUser = true;
        }
    }
}

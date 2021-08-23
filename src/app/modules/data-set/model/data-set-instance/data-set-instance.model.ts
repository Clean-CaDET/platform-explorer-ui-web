import { DataSetAnnotation } from "../data-set-annotation/data-set-annotation.model"; 
import { InstanceType } from "../enums/enums.model";

export class DataSetInstance {
    id: number = 0;
    codeSnippetId: string = '';
    link: string = '';
    projectLink: string = '';
    type: InstanceType = InstanceType.Method;
    annotations: DataSetAnnotation[] = [];
    hasAnnotationFromLoggedUser: boolean = false;
    annotationFromLoggedUser: DataSetAnnotation | null = null;

    constructor(obj?: any, annotatorId?: number) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.link = obj.link;
            this.projectLink = obj.projectLink;
            this.annotations = obj.annotations;
            this.setType(obj.type);
            this.setAnnotationFromLoggedUser(annotatorId);
        }
    }

    private setAnnotationFromLoggedUser(annotatorId: number = +sessionStorage.getItem('annotatorID')!): void {
        this.annotationFromLoggedUser = this.annotations.filter(a => a.annotator.id == annotatorId)[0];
        if (this.annotationFromLoggedUser) {
            this.hasAnnotationFromLoggedUser = true;
        }
    }

    private setType(type: string) {
        switch(+type) { 
            case 0: {
                this.type = InstanceType.Class;
                break;
            }
            case 1: { 
                this.type = InstanceType.Method;
                break; 
            } 
            default: {
                this.type = type as InstanceType;
                break;
            }
        }
    }
}
